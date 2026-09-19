-- 03_indexes.sql
-- Run this in the Supabase SQL Editor manually.

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_encounters_patient_id ON public.encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_encounter_id ON public.clinical_notes(encounter_id);
CREATE INDEX IF NOT EXISTS idx_extracted_facts_encounter_id ON public.extracted_facts(encounter_id);
CREATE INDEX IF NOT EXISTS idx_generated_summaries_encounter_id ON public.generated_summaries(encounter_id);
CREATE INDEX IF NOT EXISTS idx_claims_summary_id ON public.claims(summary_id);
CREATE INDEX IF NOT EXISTS idx_evidence_claim_id ON public.evidence(claim_id);
CREATE INDEX IF NOT EXISTS idx_evidence_note_id ON public.evidence(note_id);
CREATE INDEX IF NOT EXISTS idx_verification_results_claim_id ON public.verification_results(claim_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_summary_id ON public.doctor_reviews(summary_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_summary_id ON public.evaluation_results(summary_id);
