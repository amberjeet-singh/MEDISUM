import { spawn } from 'child_process';
import path from 'path';
import { ClinicalNoteService } from '../../services/clinicalNote.service';
import { PatientService } from '../../services/patient.service';
import { EncounterService } from '../../services/encounter.service';
import { chunkText, normalizeText, Chunk } from './chunking';
import { calculateAge, calculateLengthOfStay } from '../../utils/clinicalCalculators';
import { EncounterExtractionResult, MLPipelineOutputSchema, ExtractedFact } from '../../schemas/extraction.schema';
import { AppError } from '../../utils/AppError';

export class ExtractionService {
  private noteService: ClinicalNoteService;
  private patientService: PatientService;
  private encounterService: EncounterService;

  constructor() {
    this.noteService = new ClinicalNoteService();
    this.patientService = new PatientService();
    this.encounterService = new EncounterService();
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

    // 2. Deterministic calculations
    let ageAtEncounter: number | null = null;
    let losDays: number | null = null;
    
    try {
      if (patient.date_of_birth && encounter.admission_datetime) {
        ageAtEncounter = calculateAge(patient.date_of_birth, encounter.admission_datetime);
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

    // 3. Preprocess and Chunk Notes
    const allChunks: Chunk[] = [];
    // We normalize and chunk each note. (Normally we'd track note ID too for source spans, 
    // but the chunk schema could be extended if needed. For now, absolute string index per note is fine, 
    // or we just process all notes as one large corpus string).
    
    // To maintain source-span precision across the ENTIRE corpus, we concatenate notes with a clear separator
    // and track absolute indices.
    const corpusString = notes.map(n => normalizeText(n.content)).join('\n\n--- NOTE SEPARATOR ---\n\n');
    const corpusSize = corpusString.length;
    
    if (corpusSize > 0) {
      const chunks = chunkText(corpusString, 1500, 200);
      allChunks.push(...chunks);
    }

    // 4. ML Extraction
    let extractedFacts: ExtractedFact[] = [];
    if (allChunks.length > 0) {
      extractedFacts = await this.runPythonExtractor(allChunks);
    }

    // 5. Structure Output
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
