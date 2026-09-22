import { Request, Response, NextFunction } from 'express';
import { ClinicalNoteService } from '../services/clinicalNote.service';
import { clinicalNoteListSchema, clinicalNoteCreateSchema } from '../schemas/clinicalNote.schema';
import { idParamSchema } from '../schemas/common.schema';

const clinicalNoteService = new ClinicalNoteService();

export const listClinicalNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = clinicalNoteListSchema.parse(req.query);
    
    if (!validatedQuery.encounter_id) {
        throw new Error('encounter_id is required to list clinical notes');
    }

    const result = await clinicalNoteService.listNotesByEncounter(
      validatedQuery.encounter_id,
      validatedQuery.page,
      validatedQuery.limit
    );

    res.json({
      success: true,
      data: result,
      error: null
    });
  } catch (error) {
    next(error);
  }
};

export const getClinicalNoteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = idParamSchema.parse(req.params);
    const note = await clinicalNoteService.getNoteById(validatedParams.id);

    res.json({
      success: true,
      data: note,
      error: null
    });
  } catch (error) {
    next(error);
  }
};

export const getClinicalNoteCorpus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedQuery = clinicalNoteListSchema.parse(req.query);
        
        if (!validatedQuery.encounter_id) {
            throw new Error('encounter_id is required to retrieve the corpus');
        }
    
        const notes = await clinicalNoteService.getCorpusForGeneration(validatedQuery.encounter_id);
    
        res.json({
          success: true,
          data: {
            encounter_id: validatedQuery.encounter_id,
            notes
          },
          error: null
        });
      } catch (error) {
        next(error);
      }
};

export const createClinicalNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedBody = clinicalNoteCreateSchema.parse(req.body);
        const newNote = await clinicalNoteService.createNoteFromRoughText(validatedBody.encounter_id, validatedBody.rough_notes);

        res.json({
            success: true,
            data: newNote,
            error: null
        });
    } catch (error) {
        next(error);
    }
};
