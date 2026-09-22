export interface Patient {
    id: string; // UUID
    external_patient_ref: string | null;
    sex: string | null;
    date_of_birth: Date | string | null;
    created_at: string;
    updated_at: string;
}

export type PatientInsert = Omit<Patient, 'id' | 'created_at' | 'updated_at'>;

export interface Encounter {
    id: string; // UUID
    patient_id: string; // UUID
    service: string | null;
    attending: string | null;
    chief_complaint: string | null;
    major_surgical_or_invasive_procedure: string | null;
    admission_datetime: string | null;
    discharge_datetime: string | null;
    discharge_disposition: string | null;
    discharge_diagnosis: string | null;
    discharge_condition: string | null;
    followup_instructions: string | null;
    discharge_instructions: string | null;
    created_at: string;
    updated_at: string;
}

export type EncounterInsert = Omit<Encounter, 'id' | 'created_at' | 'updated_at'> & { patient_id: string };

export interface ClinicalNote {
    id: string; // UUID
    encounter_id: string; // UUID
    note_type: string;
    allergies: string | null;
    history_of_present_illness: string | null;
    past_medical_history: string | null;
    social_history: string | null;
    family_history: string | null;
    physical_exam: string | null;
    pertinent_results: string | null;
    medications_on_admission: string | null;
    discharge_medications: string | null;
    source_reference: string;
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
    source_chunk_id: string | null;
    source_start_index: number | null;
    source_end_index: number | null;
    confidence: number | null;
    model_name: string | null;
    model_version: string | null;
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
    source_start_index: number | null;
    source_end_index: number | null;
    created_at: string;
}

export type ClaimInsert = Omit<Claim, 'id' | 'created_at'> & { summary_id: string };

export interface Evidence {
    id: string; // UUID
    claim_id: string; // UUID
    note_id: string; // UUID
    evidence_text: string;
    source_start_index: number | null;
    source_end_index: number | null;
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
    verifier_model: string | null;
    verifier_version: string | null;
    created_at: string;
}

export type VerificationResultInsert = Omit<VerificationResult, 'id' | 'created_at'> & { claim_id: string };

export interface SourceFactCoverage {
    id: string; // UUID
    summary_id: string; // UUID
    fact_id: string; // UUID
    status: string;
    coverage_score: number | null;
    nli_label: string | null;
    confidence: number | null;
    reason: string | null;
    verifier_model: string | null;
    verifier_version: string | null;
    created_at: string;
}

export type SourceFactCoverageInsert = Omit<SourceFactCoverage, 'id' | 'created_at'> & { summary_id: string, fact_id: string };

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
