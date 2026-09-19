import { AppError } from './AppError';

/**
 * Calculates patient age based on date of birth and an encounter/reference date.
 * @param dob Date of birth (ISO string or Date)
 * @param referenceDate The date to calculate age at (e.g. admission date)
 * @returns Age in years
 */
export const calculateAge = (dob: string | Date, referenceDate: string | Date): number => {
  const birthDate = new Date(dob);
  const refDate = new Date(referenceDate);

  if (isNaN(birthDate.getTime())) {
    throw new AppError('Invalid date of birth provided for age calculation', 400);
  }
  if (isNaN(refDate.getTime())) {
    throw new AppError('Invalid reference date provided for age calculation', 400);
  }

  let age = refDate.getFullYear() - birthDate.getFullYear();
  const m = refDate.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 0) {
    throw new AppError('Reference date cannot be before date of birth', 400);
  }

  return age;
};

/**
 * Calculates Length of Stay (LOS) in days between admission and discharge.
 * @param admissionDate ISO string or Date
 * @param dischargeDate ISO string or Date
 * @returns LOS in days (minimum 0)
 */
export const calculateLengthOfStay = (admissionDate: string | Date, dischargeDate: string | Date): number => {
  const admit = new Date(admissionDate);
  const discharge = new Date(dischargeDate);

  if (isNaN(admit.getTime())) {
    throw new AppError('Invalid admission date', 400);
  }
  if (isNaN(discharge.getTime())) {
    throw new AppError('Invalid discharge date', 400);
  }

  // Calculate difference in milliseconds
  const diffTime = discharge.getTime() - admit.getTime();
  
  if (diffTime < 0) {
    throw new AppError('Discharge date cannot be before admission date', 400);
  }

  // Convert to days (using Math.ceil to treat any fraction of a day as a day)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
};
