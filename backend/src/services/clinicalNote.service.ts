import { ClinicalNoteRepository } from '../repositories/clinicalNote.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { EncounterRepository } from '../repositories/encounter.repository';
import { ClinicalNote, ClinicalNoteInsert, PatientInsert, EncounterInsert } from '../types/database.types';
import { AppError } from '../utils/AppError';

export class ClinicalNoteService {
  private clinicalNoteRepo: ClinicalNoteRepository;
  private patientRepo: PatientRepository;
  private encounterRepo: EncounterRepository;

  constructor() {
    this.clinicalNoteRepo = new ClinicalNoteRepository();
    this.patientRepo = new PatientRepository();
    this.encounterRepo = new EncounterRepository();
  }

  async listNotesByEncounter(encounterId: string, page: number, limit: number): Promise<{ data: ClinicalNote[], count: number, page: number, limit: number }> {
    const { data, count } = await this.clinicalNoteRepo.listByEncounterId(encounterId, page, limit);
    return { data, count, page, limit };
  }

  async getNoteById(id: string): Promise<ClinicalNote> {
    const note = await this.clinicalNoteRepo.findById(id);
    if (!note) {
      throw new AppError(`Clinical note with id ${id} not found`, 404);
    }
    return note;
  }

  async getCorpusForGeneration(encounterId: string): Promise<ClinicalNote[]> {
    // Retrieves the complete source-note corpus for an encounter (unpaginated)
    const notes = await this.clinicalNoteRepo.findByEncounterId(encounterId);
    if (notes.length === 0) {
      // It's a domain decision whether an empty corpus throws an error or not. 
      // We return empty array and let the orchestration layer decide.
    }
    return notes;
  }

  async createNoteFromRoughText(encounterId: string, roughNotes: string): Promise<ClinicalNote> {
    // 1. Prevent Duplicates
    const existingNotes = await this.clinicalNoteRepo.findByEncounterId(encounterId);
    if (existingNotes.length > 0) {
      return existingNotes[0]; // Reuse existing note to prevent duplication
    }

    const markers = [
        '<SEX>', '<SERVICE>', '<ALLERGIES>', '<ATTENDING>', '<CHIEF COMPLAINT>',
        '<MAJOR SURGICAL OR INVASIVE PROCEDURE>', '<HISTORY OF PRESENT ILLNESS>',
        '<PAST MEDICAL HISTORY>', '<SOCIAL HISTORY>', '<FAMILY HISTORY>',
        '<PHYSICAL EXAM>', '<PERTINENT RESULTS>', '<MEDICATIONS ON ADMISSION>',
        '<DISCHARGE MEDICATIONS>', '<DISCHARGE DISPOSITION>', '<DISCHARGE DIAGNOSIS>',
        '<DISCHARGE CONDITION>', '<FOLLOWUP INSTRUCTIONS>', '<DISCHARGE INSTRUCTIONS>'
    ];

    const parseSection = (header: string): string | null => {
        const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedMarkers = markers.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regex = new RegExp(`${escapedHeader}\\s*([\\s\\S]*?)(?=(?:${escapedMarkers.join('|')})|$)`, 'i');
        const match = roughNotes.match(regex);
        return match ? match[1].trim() : null;
    };

    // 2. Resolve Encounter and Patient
    const encounter = await this.encounterRepo.findById(encounterId);
    if (!encounter) {
        throw new AppError(`Encounter not found`, 404);
    }

    // 3. Update Patient
    const parsedSex = parseSection('<SEX>');
    if (parsedSex) {
        await this.patientRepo.update(encounter.patient_id, { sex: parsedSex });
    }

    // 4. Update Encounter
    const encounterUpdates: Partial<EncounterInsert> = {};
    const eFields = [
        { tag: '<SERVICE>', key: 'service' },
        { tag: '<ATTENDING>', key: 'attending' },
        { tag: '<CHIEF COMPLAINT>', key: 'chief_complaint' },
        { tag: '<MAJOR SURGICAL OR INVASIVE PROCEDURE>', key: 'major_surgical_or_invasive_procedure' },
        { tag: '<DISCHARGE DISPOSITION>', key: 'discharge_disposition' },
        { tag: '<DISCHARGE DIAGNOSIS>', key: 'discharge_diagnosis' },
        { tag: '<DISCHARGE CONDITION>', key: 'discharge_condition' },
        { tag: '<FOLLOWUP INSTRUCTIONS>', key: 'followup_instructions' },
        { tag: '<DISCHARGE INSTRUCTIONS>', key: 'discharge_instructions' }
    ];
    eFields.forEach(({ tag, key }) => {
        const val = parseSection(tag);
        if (val !== null) (encounterUpdates as any)[key] = val;
    });
    
    if (Object.keys(encounterUpdates).length > 0) {
        await this.encounterRepo.update(encounterId, encounterUpdates);
    }

    // 5. Create Clinical Note
    const noteInsert: ClinicalNoteInsert = {
        encounter_id: encounterId,
        note_type: 'CONSULTATION',
        source_reference: 'FRONTEND_INPUT',
        allergies: parseSection('<ALLERGIES>'),
        history_of_present_illness: parseSection('<HISTORY OF PRESENT ILLNESS>'),
        past_medical_history: parseSection('<PAST MEDICAL HISTORY>'),
        social_history: parseSection('<SOCIAL HISTORY>'),
        family_history: parseSection('<FAMILY HISTORY>'),
        physical_exam: parseSection('<PHYSICAL EXAM>'),
        pertinent_results: parseSection('<PERTINENT RESULTS>'),
        medications_on_admission: parseSection('<MEDICATIONS ON ADMISSION>'),
        discharge_medications: parseSection('<DISCHARGE MEDICATIONS>'),
        chunk_index: 0
    };

    // If no tags were found at all, put everything in HPI
    if (!noteInsert.allergies && !noteInsert.history_of_present_illness && Object.keys(encounterUpdates).length === 0 && !parsedSex) {
        noteInsert.history_of_present_illness = roughNotes.trim();
    }

    return this.clinicalNoteRepo.create(noteInsert);
  }
}
