import { describe, it, expect, jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/index';
import { AppError } from '../src/utils/AppError';

// Mock the Supabase config to prevent real network calls
jest.mock('../src/config/supabase', () => {
  return {
    supabase: {},
    checkSupabaseConnection: jest.fn<() => Promise<boolean>>().mockResolvedValue(true)
  };
});

// Mock the services to avoid real database calls during tests
jest.mock('../src/services/patient.service', () => {
  return {
    PatientService: class {
      async listPatients() {
        return {
          data: [{ id: '123e4567-e89b-12d3-a456-426614174000', external_patient_ref: 'P123', created_at: new Date().toISOString() }],
          count: 1,
          page: 1,
          limit: 20
        };
      }
      async getPatientById(id: string) {
        if (id === '123e4567-e89b-12d3-a456-426614174000') {
          return { id, external_patient_ref: 'P123', created_at: new Date().toISOString() };
        }
        throw new AppError('Patient not found', 404);
      }
    }
  };
});

jest.mock('../src/services/encounter.service', () => {
    return {
      EncounterService: class {
        async listEncountersByPatient() {
          return {
            data: [],
            count: 0,
            page: 1,
            limit: 20
          };
        }
      }
    };
});

jest.mock('../src/ai/extraction/extraction.service', () => {
  return {
    ExtractionService: class {
      async extractEncounter(id: string) {
        if (id === '123e4567-e89b-12d3-a456-426614174000') {
          return {
            encounter_id: id,
            patient_id: '123e4567-e89b-12d3-a456-426614174000',
            deterministic_metrics: {
              age_at_encounter: 45,
              length_of_stay_days: 3,
              admission_date: '2020-01-01',
              discharge_date: '2020-01-04'
            },
            extracted_facts: [
              {
                entity_type: 'DISEASE_DISORDER',
                entity_value: 'Hypertension',
                confidence: 0.99,
                startIndex: 10,
                endIndex: 22,
                source_chunk_id: 'chunk_0'
              }
            ],
            note_corpus_size: 100
          };
        }
        throw new AppError('Encounter not found', 404);
      }
    }
  };
});

describe('API v1 Routes', () => {
  
  describe('Database Connectivity (Health)', () => {
    it('should return 200 on /api/v1/health', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
    });
  });

  describe('Patients API', () => {
    it('should return paginated patients (Happy Path)', async () => {
      const res = await request(app).get('/api/v1/patients?page=1&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data.length).toBe(1);
    });

    it('should fail with invalid pagination params (Validation Failure)', async () => {
      const res = await request(app).get('/api/v1/patients?page=-1');
      expect(res.statusCode).toBe(400); // Should be 400
      expect(res.body.success).toBe(false);
    });

    it('should retrieve a patient by valid UUID (Happy Path)', async () => {
      const validId = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(app).get(`/api/v1/patients/${validId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(validId);
    });

    it('should return 404 for non-existent patient (Not Found)', async () => {
      const notFoundId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).get(`/api/v1/patients/${notFoundId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid UUID (Invalid Identifiers)', async () => {
      const invalidId = 'not-a-uuid';
      const res = await request(app).get(`/api/v1/patients/${invalidId}`);
      expect(res.statusCode).toBe(400); // Should be 400
      expect(res.body.success).toBe(false);
    });
  });

  describe('Encounters API', () => {
    it('should return empty list when patient has no encounters (Empty Results)', async () => {
      const validPatientId = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(app).get(`/api/v1/encounters?patient_id=${validPatientId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data.length).toBe(0);
      expect(res.body.data.count).toBe(0);
    });

    it('should run ML extraction for valid encounter ID', async () => {
      const validId = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(app).post(`/api/v1/encounters/${validId}/extract`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deterministic_metrics.age_at_encounter).toBe(45);
      expect(res.body.data.extracted_facts.length).toBe(1);
      expect(res.body.data.extracted_facts[0].entity_value).toBe('Hypertension');
    });

    it('should fail if patient_id is not provided', async () => {
        const res = await request(app).get(`/api/v1/encounters`);
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toContain('patient_id is required');
    });
  });

});
