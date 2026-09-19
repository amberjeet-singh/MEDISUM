import { ClinicalNoteRepository } from '../repositories/clinicalNote.repository';
import { ClinicalNote } from '../types/database.types';
import { AppError } from '../utils/AppError';

export class ClinicalNoteService {
  private clinicalNoteRepo: ClinicalNoteRepository;

  constructor() {
    this.clinicalNoteRepo = new ClinicalNoteRepository();
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
}
