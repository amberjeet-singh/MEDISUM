-- 06_seed_optional.sql
-- Run this in the Supabase SQL Editor manually (only for testing).

-- INSERT INTO public.patients (external_patient_ref, date_of_birth) VALUES ('TEST-001', '1980-01-01');
-- INSERT INTO public.encounters (patient_id, specialty) VALUES ((SELECT id FROM public.patients LIMIT 1), 'Cardiology');
