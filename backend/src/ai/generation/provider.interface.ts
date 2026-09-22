import { NormalizedSummaryOutput } from '../../schemas/generation.schema';

export interface GenerationContext {
    patient: any;
    encounter: any;
    notes: any[];
    facts: any;
    deterministicMetrics: any;
}

export interface AIProvider {
    /**
     * Generates a normalized discharge summary based on the provided context and instructions.
     * @param systemPrompt The system instructions.
     * @param userPrompt The user prompt containing the context.
     */
    generateSummary(systemPrompt: string, userPrompt: string): Promise<NormalizedSummaryOutput>;
}
