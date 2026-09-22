import { Router } from 'express';
import { listClinicalNotes, getClinicalNoteById, getClinicalNoteCorpus, createClinicalNote } from '../controllers/clinicalNote.controller';

const router = Router();

router.get('/', listClinicalNotes);
router.get('/corpus', getClinicalNoteCorpus);
router.post('/', createClinicalNote);
router.get('/:id', getClinicalNoteById);

export default router;
