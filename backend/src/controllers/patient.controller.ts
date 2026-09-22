import { Request, Response, NextFunction } from 'express';
import { PatientService } from '../services/patient.service';
import { patientSearchSchema, patientCreateSchema } from '../schemas/patient.schema';
import { idParamSchema } from '../schemas/common.schema';
import { AppError } from '../utils/AppError';

const patientService = new PatientService();

export const listPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = patientSearchSchema.parse(req.query);
    const result = await patientService.listPatients(
      validatedQuery.page,
      validatedQuery.limit,
      validatedQuery.query
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

export const getPatientById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = idParamSchema.parse(req.params);
    const patient = await patientService.getPatientById(validatedParams.id);

    res.json({
      success: true,
      data: patient,
      error: null
    });
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedBody = patientCreateSchema.parse(req.body);
    const newPatient = await patientService.createPatient({
      external_patient_ref: validatedBody.external_patient_ref || null,
      sex: validatedBody.sex || null,
      date_of_birth: validatedBody.date_of_birth || null,
    });

    res.json({
      success: true,
      data: newPatient,
      error: null
    });
  } catch (error) {
    next(error);
  }
};
