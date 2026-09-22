export interface Patient {
    id: string;
    external_patient_ref: string | null;
    sex: string | null;
    date_of_birth: string | null;
    created_at: string;
}

export interface Encounter {
    id: string;
    patient_id: string;
    service: string | null;
    attending: string | null;
    chief_complaint: string | null;
    admission_datetime: string | null;
    discharge_datetime: string | null;
    discharge_diagnosis: string | null;
    created_at: string;
}

export interface ExtractedFact {
    id: string;
    encounter_id: string;
    fact_type: string;
    fact_key: string;
    fact_value: string;
    confidence: number | null;
    created_at: string;
}

export interface GeneratedSummary {
    id: string;
    encounter_id: string;
    model_provider: string;
    model_name: string;
    status: string;
    content: string; // JSON string containing claim_extraction_text, diagnoses, etc.
    created_at: string;
}

export interface ClinicalNote {
    id: string;
    encounter_id: string;
    note_type: string;
    created_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error: any;
}

export interface PaginatedData<T> {
    data: T[];
    count: number;
    page: number;
    limit: number;
}
