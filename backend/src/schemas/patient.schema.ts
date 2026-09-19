import { z } from 'zod';
import { paginationSchema } from './common.schema';

export const patientSearchSchema = paginationSchema.extend({
  query: z.string().optional(), // Search by external_patient_ref
});
