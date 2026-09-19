import { Router } from 'express';
import { listPatients, getPatientById } from '../controllers/patient.controller';

const router = Router();

router.get('/', listPatients);
router.get('/:id', getPatientById);

export default router;
