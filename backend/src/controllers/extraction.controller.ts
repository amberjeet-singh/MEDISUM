import { Request, Response, NextFunction } from 'express';
import { ExtractionService } from '../ai/extraction/extraction.service';
import { idParamSchema } from '../schemas/common.schema';

const extractionService = new ExtractionService();

export const extractEncounterInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const result = await extractionService.extractEncounter(id);

    res.json({
      success: true,
      data: result,
      error: null
    });
  } catch (error) {
    next(error);
  }
};
