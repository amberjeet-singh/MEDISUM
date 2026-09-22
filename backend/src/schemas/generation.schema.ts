import { z } from 'zod';

export const NormalizedSummaryOutputSchema = z.object({
  summary_content: z.string(),
  diagnoses: z.array(z.string()),
  procedures: z.array(z.string()),
  medications: z.array(z.string()),
  hospital_course: z.string(),
  follow_up_instructions: z.string(),
  metadata: z.record(z.string(), z.any()).optional()
});

export type NormalizedSummaryOutput = z.infer<typeof NormalizedSummaryOutputSchema>;
