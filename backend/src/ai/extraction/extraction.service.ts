import { spawn } from 'child_process';
import path from 'path';
import { ClinicalNoteService } from '../../services/clinicalNote.service';
import { PatientService } from '../../services/patient.service';
import { EncounterService } from '../../services/encounter.service';
import { ExtractedFactRepository } from '../../repositories/extractedFact.repository';
import { chunkText, normalizeText, Chunk } from './chunking';
import { calculateAge, calculateLengthOfStay } from '../../utils/clinicalCalculators';
import { EncounterExtractionResult, MLPipelineOutputSchema, ExtractedFact } from '../../schemas/extraction.schema';
import { AppError } from '../../utils/AppError';

export class ExtractionService {
  private noteService: ClinicalNoteService;
  private patientService: PatientService;
  private encounterService: EncounterService;
  private extractedFactRepo: ExtractedFactRepository;

  constructor() {
    this.noteService = new ClinicalNoteService();
    this.patientService = new PatientService();
    this.encounterService = new EncounterService();
    this.extractedFactRepo = new ExtractedFactRepository();
  }

  /**
   * Spawns the python extractor script and passes the chunks via stdin.
   */
  private runPythonExtractor(chunks: Chunk[]): Promise<ExtractedFact[]> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'extractor.py');
      const pyProcess = spawn('python', [scriptPath]);

      let output = '';
      let errorOutput = '';

      pyProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pyProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pyProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python Extractor Error: ${errorOutput}`);
          // If Python script fails (e.g. transformers not installed), return gracefully or throw.
          // For now, we will return an empty array of facts if it crashes, or throw an AppError.
          return reject(new AppError('Failed to run medical extraction model', 500));
        }

        try {
          const parsed = JSON.parse(output);
          const validated = MLPipelineOutputSchema.parse(parsed);

          if (!validated.success) {
            console.error('Python Extractor failed internally:', validated.error);
            return resolve([]);
          }

          resolve(validated.facts);
        } catch (e) {
          console.error('Failed to parse python output', e);
          console.error('Output was:', output);
          reject(new AppError('Invalid extraction response', 500));
        }
      });

      // Write chunk data to stdin and close it
      pyProcess.stdin.write(JSON.stringify(chunks));
      pyProcess.stdin.end();
    });
  }

  async extractEncounter(encounterId: string): Promise<EncounterExtractionResult> {
    // 1. Fetch data
    const encounter = await this.encounterService.getEncounterById(encounterId);
    const patient = await this.patientService.getPatientById(encounter.patient_id);
    const notes = await this.noteService.getCorpusForGeneration(encounterId);

    console.log(`[Diagnostic]`);
    console.log(`Encounter ID: ${encounter.id}`);
    console.log(`Admission: ${encounter.admission_datetime}`);
    console.log(`Discharge: ${encounter.discharge_datetime}`);
    console.log(`DOB: ${patient.date_of_birth ? 'redacted' : 'unknown'}`);

    // 2. Deterministic calculations
    let ageAtEncounter: number | null = null;
    let losDays: number | null = null;
    
    try {
      if (patient.date_of_birth) {
        ageAtEncounter = calculateAge(patient.date_of_birth);
      }
    } catch (e) {
      console.warn('Could not calculate age', e);
    }

    try {
      if (encounter.admission_datetime && encounter.discharge_datetime) {
        losDays = calculateLengthOfStay(encounter.admission_datetime, encounter.discharge_datetime);
      }
    } catch (e) {
      console.warn('Could not calculate LOS', e);
    }

    // 3. Check for existing facts in the DB
    const dbFacts = await this.extractedFactRepo.findByEncounterId(encounterId);
    let extractedFacts: ExtractedFact[] = [];
    let corpusSize = 0;

    if (dbFacts.length === 0) {
      // 4. Preprocess and Chunk Notes for Extraction
      const allChunks: Chunk[] = [];
      let globalChunkIndex = 0;
      
      for (const n of notes) {
        const sections = [
          n.allergies,
          n.history_of_present_illness,
          n.past_medical_history,
          n.social_history,
          n.family_history,
          n.physical_exam,
          n.pertinent_results,
          n.medications_on_admission,
          n.discharge_medications
        ].filter(s => s && s.trim().length > 0);
        
        const noteText = normalizeText(sections.join('\n'));
        if (noteText.length > 0) {
          const chunks = chunkText(noteText, 1500, 200);
          for (const c of chunks) {
            c.sourceNoteId = n.id;
            c.id = `chunk_${globalChunkIndex++}`;
            allChunks.push(c);
          }
          corpusSize += noteText.length;
        }
      }

      // 5. ML Extraction
      if (allChunks.length > 0) {
        extractedFacts = await this.runPythonExtractor(allChunks);

        // Deduplicate extracted facts (overlap from chunking can cause duplicates)
        const uniqueFactsMap = new Map<string, ExtractedFact>();
        for (const fact of extractedFacts) {
            // Use entity_type, entity_value, and sourceNoteId as unique key. 
            // We ignore slight offset differences due to overlap.
            // Also python extractor passes source_note_id in the JSON, we need to handle it.
            const sourceNoteId = (fact as any).source_note_id ?? null;
            const key = `${fact.entity_type}:${fact.entity_value.toLowerCase()}:${sourceNoteId}`;
            if (!uniqueFactsMap.has(key)) {
                (fact as any).source_note_id = sourceNoteId; // store back temporarily
                uniqueFactsMap.set(key, fact);
            }
        }
        extractedFacts = Array.from(uniqueFactsMap.values());

        // 6. Persist Extracted Facts
        const factsToInsert = extractedFacts.map(fact => ({
            encounter_id: encounter.id,
            fact_type: fact.entity_type,
            fact_key: fact.entity_type, // fallback or map if needed
            fact_value: fact.entity_value,
            source_note_id: (fact as any).source_note_id ?? null,
            source_chunk_id: fact.source_chunk_id ?? null,
            source_start_index: fact.startIndex,
            source_end_index: fact.endIndex,
            confidence: fact.confidence,
            model_name: 'pabRomero/BioClinicalBERT-full-finetuned-ner-pablo',
            model_version: 'v1'
        }));

        if (factsToInsert.length > 0) {
            await this.extractedFactRepo.createMany(factsToInsert);
        }
      }
    } else {
        // If facts exist, we map them to the schema format
        extractedFacts = dbFacts.map(dbFact => ({
            entity_type: dbFact.fact_type,
            entity_value: dbFact.fact_value,
            confidence: dbFact.confidence != null ? Number(dbFact.confidence) : 1.0,
            startIndex: dbFact.source_start_index ?? 0,
            endIndex: dbFact.source_end_index ?? 0,
            source_chunk_id: dbFact.source_chunk_id ?? undefined,
            source_note_id: dbFact.source_note_id ?? undefined
        }));

        // We still need to calculate corpusSize for context
        corpusSize = notes.map(n => {
            const sections = [n.allergies, n.history_of_present_illness, n.past_medical_history, n.social_history, n.family_history, n.physical_exam, n.pertinent_results, n.medications_on_admission, n.discharge_medications].filter(s => s && s.trim().length > 0);
            return normalizeText(sections.join('\n'));
        }).join('\n\n--- NOTE SEPARATOR ---\n\n').length;
    }

    // 7. Structure Output
    return {
      encounter_id: encounter.id,
      patient_id: patient.id,
      deterministic_metrics: {
        age_at_encounter: ageAtEncounter,
        length_of_stay_days: losDays,
        admission_date: encounter.admission_datetime,
        discharge_date: encounter.discharge_datetime
      },
      extracted_facts: extractedFacts,
      note_corpus_size: corpusSize
    };
  }
}
