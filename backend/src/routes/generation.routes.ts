import { Router } from 'express';
import { generateSummary, getGeneratedSummary } from '../controllers/generation.controller';

const router = Router();

// Endpoint for generating a summary for a specific encounter
router.post('/encounters/:id/generate-summary', generateSummary);
router.get('/encounters/:id/generated-summary', getGeneratedSummary);

export default router;
