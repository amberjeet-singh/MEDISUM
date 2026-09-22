import { z } from 'zod';
import { paginationSchema } from './common.schema';

export const patientSearchSchema = paginationSchema.extend({
  query: z.string().optional(),
  sex: z.string().optional(),
});

export const patientCreateSchema = z.object({
  external_patient_ref: z.string().optional(),
  sex: z.string().optional(),
  date_of_birth: z.string().optional(),
});
