import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { calculateAge, calculateLengthOfStay } from '../src/utils/clinicalCalculators';

describe('Clinical Calculators', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    // Use the example date from the requirements: 2026-09-23
    jest.setSystemTime(new Date('2026-09-23T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('calculateAge', () => {
    it('should calculate correct completed age based on current system time', () => {
      // User Example: DOB = 2000-10-15, Today = 2026-09-23 -> Age = 25
      expect(calculateAge('2000-10-15')).toBe(25);
      
      // Birthday already occurred this year -> Age = 26
      expect(calculateAge('2000-05-15')).toBe(26);
      
      // Born exactly today, earlier year -> Age = 26
      expect(calculateAge('2000-09-23')).toBe(26);
    });

    it('should throw error if dob is in the future', () => {
      expect(() => calculateAge('2030-01-01')).toThrow('Reference date cannot be before date of birth');
    });

    it('should throw error for invalid dates', () => {
      expect(() => calculateAge('invalid-date')).toThrow('Invalid date of birth');
    });
  });

  describe('calculateLengthOfStay', () => {
    it('should calculate exact days', () => {
      expect(calculateLengthOfStay('2020-01-01', '2020-01-05')).toBe(4);
    });

    it('should return completed days (Math.floor)', () => {
      // 25 hours = 1.04 days -> 1 completed day
      expect(calculateLengthOfStay('2020-01-01T12:00:00Z', '2020-01-02T13:00:00Z')).toBe(1);
      
      // 11 hours -> 0 completed days
      expect(calculateLengthOfStay('2020-01-01T12:00:00Z', '2020-01-01T23:00:00Z')).toBe(0);
      
      // Exactly zero hours -> 0
      expect(calculateLengthOfStay('2020-01-01T12:00:00Z', '2020-01-01T12:00:00Z')).toBe(0);
      
      // Example from requirements: Admission: 2026-09-20 10:00, Discharge: 2026-09-23 10:00 -> 3 days
      expect(calculateLengthOfStay('2026-09-20T10:00:00Z', '2026-09-23T10:00:00Z')).toBe(3);
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
