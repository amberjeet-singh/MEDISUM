-- 05_functions_and_triggers.sql
-- Run this in the Supabase SQL Editor manually.

-- Trigger to automatically update `updated_at` column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to patients
DROP TRIGGER IF EXISTS trg_patients_updated_at ON public.patients;
CREATE TRIGGER trg_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to encounters
DROP TRIGGER IF EXISTS trg_encounters_updated_at ON public.encounters;
CREATE TRIGGER trg_encounters_updated_at
BEFORE UPDATE ON public.encounters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to doctor_reviews
DROP TRIGGER IF EXISTS trg_doctor_reviews_updated_at ON public.doctor_reviews;
CREATE TRIGGER trg_doctor_reviews_updated_at
BEFORE UPDATE ON public.doctor_reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
