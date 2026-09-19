import { Router } from 'express';
import { listEncounters, getEncounterById } from '../controllers/encounter.controller';

const router = Router();

router.get('/', listEncounters);
router.get('/:id', getEncounterById);

export default router;
