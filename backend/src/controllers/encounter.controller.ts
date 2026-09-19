import { Request, Response, NextFunction } from 'express';
import { EncounterService } from '../services/encounter.service';
import { encounterListSchema } from '../schemas/encounter.schema';
import { idParamSchema } from '../schemas/common.schema';

const encounterService = new EncounterService();

export const listEncounters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = encounterListSchema.parse(req.query);
    
    // According to REST principles, this might be better under /patients/:patient_id/encounters
    // But if we allow filtering by patient_id via query params, we must handle it.
    if (!validatedQuery.patient_id) {
        // Business rule: we require a patient_id to list encounters, as returning all encounters system-wide isn't safe.
        // We can throw an error or just return empty for now, let's enforce it in schema or here.
        throw new Error('patient_id is required to list encounters'); // Will be caught and passed to errorHandler
    }

    const result = await encounterService.listEncountersByPatient(
      validatedQuery.patient_id,
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

export const getEncounterById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = idParamSchema.parse(req.params);
    const encounter = await encounterService.getEncounterById(validatedParams.id);

    res.json({
      success: true,
      data: encounter,
      error: null
    });
  } catch (error) {
    next(error);
  }
};
