import axios from 'axios';
import type { ApiResponse, Encounter, ExtractedFact, GeneratedSummary, PaginatedData, Patient, ClinicalNote } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 600000, // 10 minutes timeout for ML operations
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    // Patients
    getPatients: async (page = 1, limit = 20) => {
        const res = await apiClient.get<ApiResponse<PaginatedData<Patient>>>(`/patients?page=${page}&limit=${limit}`);
        return res.data.data;
    },
    getPatient: async (id: string) => {
        const res = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
        return res.data.data;
    },
    createPatient: async (data: { external_patient_ref?: string, sex?: string, date_of_birth?: string }) => {
        const res = await apiClient.post<ApiResponse<Patient>>(`/patients`, data);
        return res.data.data;
    },

    // Encounters
    getPatientEncounters: async (patientId: string, page = 1, limit = 20) => {
        const res = await apiClient.get<ApiResponse<PaginatedData<Encounter>>>(`/encounters?patient_id=${patientId}&page=${page}&limit=${limit}`);
        return res.data.data;
    },
    getEncounter: async (id: string) => {
        const res = await apiClient.get<ApiResponse<Encounter>>(`/encounters/${id}`);
        return res.data.data;
    },
    createEncounter: async (data: { patient_id: string, service?: string, attending?: string, chief_complaint?: string, admission_datetime?: string, discharge_datetime?: string }) => {
        const res = await apiClient.post<ApiResponse<Encounter>>(`/encounters`, data);
        return res.data.data;
    },

    // Clinical Notes / Consultations
    saveConsultationNotes: async (encounterId: string, roughNotes: string) => {
        const res = await apiClient.post<ApiResponse<ClinicalNote>>(`/notes`, {
            encounter_id: encounterId,
            rough_notes: roughNotes,
        });
        return res.data.data;
    },
    getEncounterNotes: async (encounterId: string) => {
        const res = await apiClient.get<ApiResponse<PaginatedData<ClinicalNote>>>(`/notes?encounter_id=${encounterId}`);
        return res.data.data;
    },

    // Extraction
    extractEncounter: async (encounterId: string) => {
        const res = await apiClient.post<ApiResponse<any>>(`/encounters/${encounterId}/extract`);
        return res.data.data.extracted_facts as ExtractedFact[];
    },

    // Generation
    generateSummary: async (encounterId: string) => {
        const res = await apiClient.post<ApiResponse<GeneratedSummary>>(`/encounters/${encounterId}/generate-summary`);
        return res.data.data;
    },
    getGeneratedSummary: async (encounterId: string) => {
        const res = await apiClient.get<ApiResponse<GeneratedSummary | null>>(`/encounters/${encounterId}/generated-summary`);
        return res.data.data;
    }
};
