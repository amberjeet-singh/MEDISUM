import { EncounterRepository } from '../repositories/encounter.repository';
import { Encounter, EncounterInsert } from '../types/database.types';
import { AppError } from '../utils/AppError';

export class EncounterService {
  private encounterRepo: EncounterRepository;

  constructor() {
    this.encounterRepo = new EncounterRepository();
  }

  async listEncountersByPatient(patientId: string, page: number, limit: number): Promise<{ data: Encounter[], count: number, page: number, limit: number }> {
    const { data, count } = await this.encounterRepo.findByPatientId(patientId, page, limit);
    return { data, count, page, limit };
  }

  async getEncounterById(id: string): Promise<Encounter> {
    const encounter = await this.encounterRepo.findById(id);
    if (!encounter) {
      throw new AppError(`Encounter with id ${id} not found`, 404);
    }
    return encounter;
  }

  async createEncounter(encounterData: EncounterInsert): Promise<Encounter> {
    return this.encounterRepo.create(encounterData);
  }

  async updateEncounter(id: string, updates: Partial<EncounterInsert>): Promise<Encounter> {
    return this.encounterRepo.update(id, updates);
  }
}
