import { describe, it, expect } from '@jest/globals';
import { calculateAge, calculateLengthOfStay } from '../src/utils/clinicalCalculators';

describe('Clinical Calculators', () => {
  describe('calculateAge', () => {
    it('should calculate correct age for a normal birthdate', () => {
      const dob = '1990-05-15';
      const refDate = '2020-05-15';
      expect(calculateAge(dob, refDate)).toBe(30);
    });

    it('should account for leap years correctly', () => {
      // Born on leap year
      const dob = '2000-02-29';
      // Next year, not leap year, so on Feb 28 they are not 1 yet. 
      // On March 1st they are 1.
      expect(calculateAge(dob, '2001-02-28')).toBe(0);
      expect(calculateAge(dob, '2001-03-01')).toBe(1);
      
      // Another leap year
      expect(calculateAge(dob, '2004-02-28')).toBe(3);
      expect(calculateAge(dob, '2004-02-29')).toBe(4);
    });

    it('should throw error if ref date is before dob', () => {
      expect(() => calculateAge('2000-01-01', '1999-12-31')).toThrow('Reference date cannot be before date of birth');
    });

    it('should throw error for invalid dates', () => {
      expect(() => calculateAge('invalid-date', '2000-01-01')).toThrow('Invalid date of birth');
      expect(() => calculateAge('2000-01-01', 'invalid')).toThrow('Invalid reference date');
    });
  });

  describe('calculateLengthOfStay', () => {
    it('should calculate exact days', () => {
      expect(calculateLengthOfStay('2020-01-01', '2020-01-05')).toBe(4);
    });

    it('should handle fractional days by rounding up (Math.ceil)', () => {
      // Admit at 12:00 PM, Discharge next day at 1:00 PM (25 hours = 1.04 days -> 2 days)
      expect(calculateLengthOfStay('2020-01-01T12:00:00Z', '2020-01-02T13:00:00Z')).toBe(2);
      
      // Admit at 12:00 PM, Discharge same day at 11:00 PM (11 hours -> 1 day)
      expect(calculateLengthOfStay('2020-01-01T12:00:00Z', '2020-01-01T23:00:00Z')).toBe(1);
      
      // Exactly zero hours -> 0
      expect(calculateLengthOfStay('2020-01-01T12:00:00Z', '2020-01-01T12:00:00Z')).toBe(0);
    });

    it('should throw error if discharge is before admit', () => {
      expect(() => calculateLengthOfStay('2020-01-05', '2020-01-01')).toThrow('Discharge date cannot be before admission date');
    });

    it('should throw error for invalid dates', () => {
      expect(() => calculateLengthOfStay('invalid', '2020-01-01')).toThrow('Invalid admission date');
      expect(() => calculateLengthOfStay('2020-01-01', 'invalid')).toThrow('Invalid discharge date');
    });
  });
});
