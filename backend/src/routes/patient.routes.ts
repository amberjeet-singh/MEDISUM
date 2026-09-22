import { Router } from 'express';
import { listPatients, getPatientById, createPatient } from '../controllers/patient.controller';

const router = Router();

router.get('/', listPatients);
router.post('/', createPatient);
router.get('/:id', getPatientById);

export default router;
