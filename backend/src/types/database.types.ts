export interface Patient {
    id: string; // UUID
    external_patient_ref: string | null;
    date_of_birth: Date | string | null;
    created_at: string;
    updated_at: string;
}

export type PatientInsert = Omit<Patient, 'id' | 'created_at' | 'updated_at'>;

export interface Encounter {
    id: string; // UUID
    patient_id: string; // UUID
    admission_datetime: string | null;
    discharge_datetime: string | null;
    specialty: string | null;
    created_at: string;
    updated_at: string;
}

export type EncounterInsert = Omit<Encounter, 'id' | 'created_at' | 'updated_at'> & { patient_id: string };

export interface ClinicalNote {
    id: string; // UUID
    encounter_id: string; // UUID
    note_type: string;
    content: string;
    source_reference: string | null;
    chunk_index: number | null;
    created_at: string;
}

export type ClinicalNoteInsert = Omit<ClinicalNote, 'id' | 'created_at'> & { encounter_id: string };

export interface ExtractedFact {
    id: string; // UUID
    encounter_id: string; // UUID
    fact_type: string;
    fact_key: string;
    fact_value: string;
    source_note_id: string | null;
    created_at: string;
}

export type ExtractedFactInsert = Omit<ExtractedFact, 'id' | 'created_at'> & { encounter_id: string };

export interface GeneratedSummary {
    id: string; // UUID
    encounter_id: string; // UUID
    model_provider: string;
    model_name: string | null;
    prompt_version: string;
    content: string;
    generation_metadata: any | null; // JSONB
    status: string;
    created_at: string;
}

export type GeneratedSummaryInsert = Omit<GeneratedSummary, 'id' | 'created_at'> & { encounter_id: string };

export interface Claim {
    id: string; // UUID
    summary_id: string; // UUID
    claim_order: number;
    claim_text: string;
    claim_type: string | null;
    created_at: string;
}

export type ClaimInsert = Omit<Claim, 'id' | 'created_at'> & { summary_id: string };

export interface Evidence {
    id: string; // UUID
    claim_id: string; // UUID
    note_id: string; // UUID
    evidence_text: string;
    similarity_score: number | null;
    rank: number | null;
    created_at: string;
}

export type EvidenceInsert = Omit<Evidence, 'id' | 'created_at'> & { claim_id: string, note_id: string };

export interface VerificationResult {
    id: string; // UUID
    claim_id: string; // UUID
    status: string;
    nli_label: string | null;
    confidence: number | null;
    reason: string | null;
    created_at: string;
}

export type VerificationResultInsert = Omit<VerificationResult, 'id' | 'created_at'> & { claim_id: string };

export interface DoctorReview {
    id: string; // UUID
    summary_id: string; // UUID
    reviewer_id: string | null; // UUID
    edited_content: string | null;
    review_status: string;
    review_notes: string | null;
    created_at: string;
    updated_at: string;
}

export type DoctorReviewInsert = Omit<DoctorReview, 'id' | 'created_at' | 'updated_at'> & { summary_id: string };

export interface EvaluationResult {
    id: string; // UUID
    summary_id: string | null; // UUID
    evaluation_type: string;
    metric_name: string;
    metric_value: number | null;
    details: any | null; // JSONB
    created_at: string;
}

export type EvaluationResultInsert = Omit<EvaluationResult, 'id' | 'created_at'>;
