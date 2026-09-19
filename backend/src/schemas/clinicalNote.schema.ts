import { z } from 'zod';
import { paginationSchema, uuidSchema } from './common.schema';

export const clinicalNoteListSchema = paginationSchema.extend({
  encounter_id: uuidSchema.optional(),
});
