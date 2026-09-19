import { Router } from 'express';
import { extractEncounterInfo } from '../controllers/extraction.controller';

const router = Router();

// Endpoint to trigger ML extraction pipeline for an encounter
router.post('/:id/extract', extractEncounterInfo);

export default router;
