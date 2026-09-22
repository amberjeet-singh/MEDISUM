import { Router } from 'express';
import { generateSummary } from '../controllers/generation.controller';

const router = Router();

// Endpoint for generating a summary for a specific encounter
router.post('/encounters/:id/generate-summary', generateSummary);

export default router;
