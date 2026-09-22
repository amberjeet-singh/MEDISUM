import { z } from 'zod';
import { paginationSchema, uuidSchema } from './common.schema';

export const clinicalNoteListSchema = paginationSchema.extend({
  encounter_id: uuidSchema.optional(),
  note_type: z.string().optional(),
});

export const clinicalNoteCreateSchema = z.object({
  encounter_id: uuidSchema,
  rough_notes: z.string().min(1, 'Rough notes cannot be empty'),
});
