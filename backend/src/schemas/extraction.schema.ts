import { z } from 'zod';

// The type of medical entities we can extract
export const EntityTypeSchema = z.enum([
  'DIAGNOSIS',
  'MEDICATION',
  'PROCEDURE',
  'SYMPTOM',
  'ALLERGY',
  'LAB_FINDING',
  'DEMOGRAPHIC' // Dates, Age, etc., although we compute deterministically, NER might find it.
]);

// Represents an extracted fact with its absolute span mapped back to the source note
export const ExtractedFactSchema = z.object({
  entity_type: z.string(), // Extracted by NER
  entity_value: z.string(), // The text span that was extracted
  confidence: z.number().min(0).max(1),
  startIndex: z.number().int().min(0),
  endIndex: z.number().int().min(0),
  source_chunk_id: z.string().optional(),
  source_note_id: z.string().uuid().nullable().optional()
});

// The payload sent back by the Python ML pipeline
export const MLPipelineOutputSchema = z.object({
  success: z.boolean(),
  facts: z.array(ExtractedFactSchema),
  error: z.string().nullable().optional()
});

// The final calculated and extracted response for an encounter
export const EncounterExtractionResultSchema = z.object({
  encounter_id: z.string().uuid(),
  patient_id: z.string().uuid(),

  deterministic_metrics: z.object({
    age_at_encounter: z.number().nullable(),
    length_of_stay_days: z.number().nullable(),
    admission_date: z.string().nullable(),
    discharge_date: z.string().nullable()
  }),
  extracted_facts: z.array(ExtractedFactSchema),
  note_corpus_size: z.number().int()
});

export type ExtractedFact = z.infer<typeof ExtractedFactSchema>;
export type EncounterExtractionResult = z.infer<typeof EncounterExtractionResultSchema>;
