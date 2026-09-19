-- 02_schema.sql
-- Run this in the Supabase SQL Editor manually.

-- Patients
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_patient_ref TEXT,
    date_of_birth DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Encounters
CREATE TABLE IF NOT EXISTS public.encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    admission_datetime TIMESTAMPTZ,
    discharge_datetime TIMESTAMPTZ,
    specialty TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clinical Notes
CREATE TABLE IF NOT EXISTS public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
    note_type TEXT NOT NULL,
    content TEXT NOT NULL,
    source_reference TEXT,
    chunk_index INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extracted Facts
CREATE TABLE IF NOT EXISTS public.extracted_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
    fact_type TEXT NOT NULL,
    fact_key TEXT NOT NULL,
    fact_value TEXT NOT NULL,
    source_note_id UUID REFERENCES public.clinical_notes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Generated Summaries
CREATE TABLE IF NOT EXISTS public.generated_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
    model_provider TEXT NOT NULL,
    model_name TEXT,
    prompt_version TEXT NOT NULL,
    content TEXT NOT NULL,
    generation_metadata JSONB,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Claims
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    summary_id UUID NOT NULL REFERENCES public.generated_summaries(id) ON DELETE CASCADE,
    claim_order INTEGER NOT NULL,
    claim_text TEXT NOT NULL,
    claim_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evidence
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES public.clinical_notes(id) ON DELETE CASCADE,
    evidence_text TEXT NOT NULL,
    similarity_score NUMERIC,
    rank INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verification Results
CREATE TABLE IF NOT EXISTS public.verification_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- supported, contradicted, not_found
    nli_label TEXT,
    confidence NUMERIC,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Doctor Reviews
CREATE TABLE IF NOT EXISTS public.doctor_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    summary_id UUID NOT NULL REFERENCES public.generated_summaries(id) ON DELETE CASCADE,
    reviewer_id UUID,
    edited_content TEXT,
    review_status TEXT NOT NULL,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evaluation Results
CREATE TABLE IF NOT EXISTS public.evaluation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    summary_id UUID REFERENCES public.generated_summaries(id) ON DELETE CASCADE,
    evaluation_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
