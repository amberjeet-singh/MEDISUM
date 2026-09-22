import { Router } from 'express';
import { listEncounters, getEncounterById, createEncounter } from '../controllers/encounter.controller';

const router = Router();

router.get('/', listEncounters);
router.post('/', createEncounter);
router.get('/:id', getEncounterById);

export default router;
