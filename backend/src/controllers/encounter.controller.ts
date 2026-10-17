import { Request, Response, NextFunction } from 'express';
import { EncounterService } from '../services/encounter.service';
import { encounterListSchema, encounterCreateSchema } from '../schemas/encounter.schema';
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

export const createEncounter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedBody = encounterCreateSchema.parse(req.body);
    const newEncounter = await encounterService.createEncounter({
      patient_id: validatedBody.patient_id,
      service: validatedBody.service || null,
      attending: validatedBody.attending || null,
      chief_complaint: validatedBody.chief_complaint || null,
      major_surgical_or_invasive_procedure: null,
      admission_datetime: validatedBody.admission_datetime || null,
      discharge_datetime: validatedBody.discharge_datetime || null,
      discharge_disposition: null,
      discharge_diagnosis: null,
      discharge_condition: null,
      followup_instructions: null,
      discharge_instructions: null,
    });

    res.json({
      success: true,
      data: newEncounter,
      error: null
    });
  } catch (error) {
    next(error);
  }
};
