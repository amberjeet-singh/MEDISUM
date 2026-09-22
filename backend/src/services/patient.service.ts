import { PatientRepository } from '../repositories/patient.repository';
import { Patient, PatientInsert } from '../types/database.types';
import { AppError } from '../utils/AppError';

export class PatientService {
  private patientRepo: PatientRepository;

  constructor() {
    this.patientRepo = new PatientRepository();
  }

  async listPatients(page: number, limit: number, query?: string): Promise<{ data: Patient[], count: number, page: number, limit: number }> {
    const { data, count } = await this.patientRepo.list(page, limit, query);
    return { data, count, page, limit };
  }

  async getPatientById(id: string): Promise<Patient> {
    const patient = await this.patientRepo.findById(id);
    if (!patient) {
      throw new AppError(`Patient with id ${id} not found`, 404);
    }
    return patient;
  }

  async createPatient(patientData: PatientInsert): Promise<Patient> {
    return this.patientRepo.create(patientData);
  }

  async updatePatient(id: string, updates: Partial<PatientInsert>): Promise<Patient> {
    return this.patientRepo.update(id, updates);
  }
}
