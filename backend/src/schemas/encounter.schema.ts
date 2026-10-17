import { z } from 'zod';
import { paginationSchema, uuidSchema } from './common.schema';

export const encounterListSchema = paginationSchema.extend({
  patient_id: uuidSchema.optional(),
  service: z.string().optional(),
  attending: z.string().optional(),
});

export const encounterCreateSchema = z.object({
  patient_id: uuidSchema,
  service: z.string().optional(),
  attending: z.string().optional(),
  chief_complaint: z.string().optional(),
  admission_datetime: z.string().optional(),
  discharge_datetime: z.string().optional(),
});
