import { z } from 'zod';
import { paginationSchema, uuidSchema } from './common.schema';

export const encounterListSchema = paginationSchema.extend({
  patient_id: uuidSchema.optional(),
});
