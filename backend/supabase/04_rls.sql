-- 04_rls.sql
-- Run this in the Supabase SQL Editor manually.

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_results ENABLE ROW LEVEL SECURITY;

-- Note: Since this backend runs as a trusted server environment connecting via the service role key 
-- or a backend-specific API key, these policies might need to allow service roles full access.
-- If using anon key + auth, define appropriate policies here. 
-- For backend-only access, we allow full access to authenticated service role or bypass via Service Role Key.

-- Example basic policy to allow authenticated users to read patients
-- CREATE POLICY "Allow authenticated read patients" ON public.patients FOR SELECT TO authenticated USING (true);

-- Explicitly grant permissions to the backend service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.encounters TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinical_notes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.extracted_facts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_summaries TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.claims TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_results TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_reviews TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evaluation_results TO service_role;

-- Grant sequence usage in case any tables use auto-incrementing integers (though UUID is default)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

