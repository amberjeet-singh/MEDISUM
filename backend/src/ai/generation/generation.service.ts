import { AIProvider, GenerationContext } from './provider.interface';
import { env } from '../../config/env';
import { MockSummaryProvider } from './mock.provider';
import { GeminiSummaryProvider } from './gemini.provider';
import { ExtractionService } from '../extraction/extraction.service';
import { ClinicalNoteService } from '../../services/clinicalNote.service';
import { GeneratedSummaryRepository } from '../../repositories/generatedSummary.repository';
import { getSystemPrompt, buildUserPrompt, PROMPT_VERSION_V1 } from './prompts';
import { NormalizedSummaryOutput } from '../../schemas/generation.schema';
import { AppError } from '../../utils/AppError';

export class GenerationService {
    private provider: AIProvider;
    private extractionService: ExtractionService;
    private noteService: ClinicalNoteService;
    private generatedSummaryRepo: GeneratedSummaryRepository;

    constructor() {
        this.extractionService = new ExtractionService();
        this.noteService = new ClinicalNoteService();
        this.generatedSummaryRepo = new GeneratedSummaryRepository();
        
        // Select provider based on configuration
        if (!env.USE_MOCK_AI) {
            console.log('GenerationService: Selected GeminiSummaryProvider');
            this.provider = new GeminiSummaryProvider();
        } else {
            console.log(`GenerationService: Selected MockSummaryProvider (env.USE_MOCK_AI is true)`);
            this.provider = new MockSummaryProvider();
        }
    }

    async generateDischargeSummary(encounterId: string): Promise<NormalizedSummaryOutput> {
        // 1. Validate encounter & gather all context data using the Extraction Service pipeline
        let extractionResult;
        let notes;
        try {
            extractionResult = await this.extractionService.extractEncounter(encounterId);
            notes = await this.noteService.getCorpusForGeneration(encounterId);
        } catch (error: any) {
            throw new AppError(`Failed to retrieve clinical context: ${error.message}`, error.statusCode || 500);
        }

        // We use the ExtractionService to grab:
        // - patient info (implied through extraction mapping)
        // - encounter info
        // - deterministic metrics
        // - BioClinicalBERT extracted facts
        
        // Compact extracted_facts to minimize prompt tokens (Group by fact_type/entity_type)
        const compactedFacts: Record<string, string[]> = {};
        if (extractionResult.extracted_facts && Array.isArray(extractionResult.extracted_facts)) {
            for (const fact of extractionResult.extracted_facts) {
                const type = fact.entity_type;
                const value = fact.entity_value;
                if (!type || !value) continue;
                
                if (!compactedFacts[type]) {
                    compactedFacts[type] = [];
                }
                if (!compactedFacts[type].includes(value)) {
                    compactedFacts[type].push(value);
                }
            }
        }

        // We use NoteService to grab the full source notes so the LLM has complete context.
        const context: GenerationContext = {
            patient: { id: extractionResult.patient_id },
            encounter: { id: extractionResult.encounter_id },
            notes: notes,
            facts: compactedFacts,
            deterministicMetrics: extractionResult.deterministic_metrics
        };

        const systemPrompt = getSystemPrompt();
        const userPrompt = buildUserPrompt(context);

        // 2. Call the AI Provider
        let normalizedOutput: NormalizedSummaryOutput;
        try {
            normalizedOutput = await this.provider.generateSummary(systemPrompt, userPrompt);
        } catch (error: any) {
            // Persist the failure state if possible
            await this.generatedSummaryRepo.create({
                encounter_id: encounterId,
                model_provider: env.USE_MOCK_AI ? 'mock' : 'gemini',
                model_name: env.USE_MOCK_AI ? 'mock-model' : 'gemini-3.8-flash',
                prompt_version: PROMPT_VERSION_V1,
                content: "GENERATION_FAILED",
                generation_metadata: { error: error.message },
                status: 'FAILED'
            });
            throw error;
        }

        // 3. Persist successful generation
        await this.generatedSummaryRepo.create({
            encounter_id: encounterId,
            model_provider: env.USE_MOCK_AI ? 'mock' : 'gemini',
            model_name: env.USE_MOCK_AI ? 'mock-model' : 'gemini-3.8-flash',
            prompt_version: PROMPT_VERSION_V1,
            content: JSON.stringify(normalizedOutput),
            generation_metadata: { contextSize: extractionResult.note_corpus_size },
            status: 'COMPLETED'
        });

        // 4. Return
        return normalizedOutput;
    }
}
