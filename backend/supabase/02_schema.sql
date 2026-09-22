-- ============================================================
-- 2. PATIENTS
-- ============================================================

CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    external_patient_ref TEXT,
    sex TEXT,
    date_of_birth DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. ENCOUNTERS
-- ============================================================

CREATE TABLE public.encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    patient_id UUID NOT NULL
        REFERENCES public.patients(id)
        ON DELETE CASCADE,

    service TEXT,

    attending TEXT,

    chief_complaint TEXT,

    major_surgical_or_invasive_procedure TEXT,

    admission_datetime TIMESTAMPTZ,
    discharge_datetime TIMESTAMPTZ,

    discharge_disposition TEXT,

    discharge_diagnosis TEXT,

    discharge_condition TEXT,

    followup_instructions TEXT,

    discharge_instructions TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 4. CLINICAL NOTES
-- ============================================================
-- These columns contain the clinical information from the
-- original MIMIC "input" record.
--
-- No generic "content" column is used.
-- Each major source section is stored separately.
-- ============================================================

CREATE TABLE public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    encounter_id UUID NOT NULL
        REFERENCES public.encounters(id)
        ON DELETE CASCADE,

    note_type TEXT NOT NULL,

    allergies TEXT,

    history_of_present_illness TEXT,

    past_medical_history TEXT,

    social_history TEXT,

    family_history TEXT,

    physical_exam TEXT,

    pertinent_results TEXT,

    medications_on_admission TEXT,

    discharge_medications TEXT,

    source_reference TEXT NOT NULL,

    chunk_index INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 5. EXTRACTED FACTS
-- ============================================================
-- Populated by Task 4 / BioClinicalBERT.
-- Not manually populated from the raw dataset.
-- ============================================================

CREATE TABLE public.extracted_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    encounter_id UUID NOT NULL
        REFERENCES public.encounters(id)
        ON DELETE CASCADE,

    fact_type TEXT NOT NULL,

    fact_key TEXT NOT NULL,

    fact_value TEXT NOT NULL,

    source_note_id UUID
        REFERENCES public.clinical_notes(id)
        ON DELETE SET NULL,

    source_chunk_id TEXT,

    source_start_index INTEGER,

    source_end_index INTEGER,

    confidence NUMERIC,

    model_name TEXT,

    model_version TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 6. REFERENCE SUMMARIES
-- ============================================================
-- Stores the MIMIC "target" separately.
-- This is reference/ground-truth data for evaluation.
-- It is NOT used as the source input for generation/verification.
-- ============================================================

CREATE TABLE public.reference_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    encounter_id UUID NOT NULL
        REFERENCES public.encounters(id)
        ON DELETE CASCADE,

    source_reference TEXT NOT NULL,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 7. GENERATED SUMMARIES
-- ============================================================

CREATE TABLE public.generated_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    encounter_id UUID NOT NULL
        REFERENCES public.encounters(id)
        ON DELETE CASCADE,

    model_provider TEXT NOT NULL,

    model_name TEXT,

    prompt_version TEXT NOT NULL,

    content TEXT NOT NULL,

    generation_metadata JSONB,

    status TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 8. CLAIMS
-- ============================================================

CREATE TABLE public.claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    summary_id UUID NOT NULL
        REFERENCES public.generated_summaries(id)
        ON DELETE CASCADE,

    claim_order INTEGER NOT NULL,

    claim_text TEXT NOT NULL,

    claim_type TEXT,

    source_start_index INTEGER,

    source_end_index INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 9. EVIDENCE
-- ============================================================

CREATE TABLE public.evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    claim_id UUID NOT NULL
        REFERENCES public.claims(id)
        ON DELETE CASCADE,

    note_id UUID NOT NULL
        REFERENCES public.clinical_notes(id)
        ON DELETE CASCADE,

    evidence_text TEXT NOT NULL,

    source_start_index INTEGER,

    source_end_index INTEGER,

    similarity_score NUMERIC,

    rank INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 10. VERIFICATION RESULTS
-- ============================================================

CREATE TABLE public.verification_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    claim_id UUID NOT NULL
        REFERENCES public.claims(id)
        ON DELETE CASCADE,

    status TEXT NOT NULL,

    nli_label TEXT,

    confidence NUMERIC,

    reason TEXT,

    verifier_model TEXT,

    verifier_version TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 11. SOURCE FACT COVERAGE / OMISSION RESULTS
-- ============================================================
-- Used by Task 6 to explicitly detect source facts that are
-- missing from the generated summary.
--
-- This is separate from hallucination/claim verification.
-- ============================================================

CREATE TABLE public.source_fact_coverage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    summary_id UUID NOT NULL
        REFERENCES public.generated_summaries(id)
        ON DELETE CASCADE,

    fact_id UUID NOT NULL
        REFERENCES public.extracted_facts(id)
        ON DELETE CASCADE,

    status TEXT NOT NULL,
    -- COVERED / OMITTED / UNCERTAIN

    coverage_score NUMERIC,

    nli_label TEXT,

    confidence NUMERIC,

    reason TEXT,

    verifier_model TEXT,

    verifier_version TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 12. DOCTOR REVIEWS
-- ============================================================

CREATE TABLE public.doctor_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    summary_id UUID NOT NULL
        REFERENCES public.generated_summaries(id)
        ON DELETE CASCADE,

    reviewer_id UUID,

    edited_content TEXT,

    review_status TEXT NOT NULL,

    review_notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 13. EVALUATION RESULTS
-- ============================================================

CREATE TABLE public.evaluation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    summary_id UUID
        REFERENCES public.generated_summaries(id)
        ON DELETE CASCADE,

    evaluation_type TEXT NOT NULL,

    metric_name TEXT NOT NULL,

    metric_value NUMERIC,

    details JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
