import { Router } from 'express';
import { listClinicalNotes, getClinicalNoteById, getClinicalNoteCorpus } from '../controllers/clinicalNote.controller';

const router = Router();

router.get('/', listClinicalNotes);
router.get('/corpus', getClinicalNoteCorpus);
router.get('/:id', getClinicalNoteById);

export default router;
