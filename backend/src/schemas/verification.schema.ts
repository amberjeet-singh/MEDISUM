import { z } from 'zod';

export const VerificationStatusSchema = z.enum(['SUPPORTED', 'CONTRADICTED', 'NOT_FOUND']);
export const CoverageStatusSchema = z.enum(['COVERED', 'OMITTED', 'UNCERTAIN']);

export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;
export type CoverageStatus = z.infer<typeof CoverageStatusSchema>;

// Python Script Output Schemas
export const PythonEvidenceSchema = z.object({
    source_note_id: z.string(),
    source_chunk_id: z.string(),
    source_start_index: z.number().nullable().optional(),
    source_end_index: z.number().nullable().optional(),
    evidence_text: z.string(),
    similarity_score: z.number(),
    rank: z.number()
});

export const PythonClaimVerificationSchema = z.object({
    claim_id: z.string(),
    claim_text: z.string(),
    evidence: z.array(PythonEvidenceSchema),
    nli_label: z.string().nullable(), // entailment, contradiction, neutral
    nli_confidence: z.number().nullable(),
    similarity_score: z.number(), // best similarity
    status: VerificationStatusSchema,
    reason: z.string().optional()
});

export const PythonCoverageSchema = z.object({
    source_fact_id: z.string(),
    status: CoverageStatusSchema,
    coverage_score: z.number().nullable(),
    nli_label: z.string().nullable(),
    nli_confidence: z.number().nullable(),
    reason: z.string().optional()
});

export const PythonVerificationOutputSchema = z.object({
    success: z.boolean(),
    claims: z.array(PythonClaimVerificationSchema).optional(),
    coverage: z.array(PythonCoverageSchema).optional(),
    error: z.string().nullable().optional()
});

// API Output Schemas
export const APIDeterministicCheckSchema = z.object({
    age: z.array(z.string()),
    dates: z.array(z.string()),
    length_of_stay: z.array(z.string())
});

export const APIVerificationResponseSchema = z.object({
    summary: z.any(), // basic summary info
    claims: z.object({
        all: z.array(z.any()),
        supported: z.array(z.any()),
        contradicted: z.array(z.any()),
        not_found: z.array(z.any())
    }),
    deterministic_checks: APIDeterministicCheckSchema,
    source_fact_coverage: z.object({
        all: z.array(z.any()),
        covered: z.array(z.any()),
        omitted: z.array(z.any()),
        uncertain: z.array(z.any())
    }),
    metadata: z.object({
        verification_run_id: z.string(),
        models: z.any(),
        thresholds: z.any(),
        timestamp: z.string()
    })
});
