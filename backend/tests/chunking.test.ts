import { describe, it, expect } from '@jest/globals';
import { normalizeText, chunkText } from '../src/ai/extraction/chunking';

describe('Chunking Utilities', () => {
  describe('normalizeText', () => {
    it('should trim text but preserve internal spacing for strict spans', () => {
      const text = '  \n  Patient has history of COPD. \n\n  ';
      const result = normalizeText(text);
      expect(result).toBe('Patient has history of COPD.');
    });
  });

  describe('chunkText', () => {
    it('should split text correctly into chunks respecting max limits', () => {
      const text = 'Word1 Word2 Word3 Word4 Word5';
      // Max 12 chars
      const chunks = chunkText(text, 12, 0);
      // 'Word1 Word2 ' (12)
      // 'Word3 Word4 ' (12)
      // 'Word5' (5)
      
      expect(chunks.length).toBeGreaterThan(1);
      
      // Verify spans match exactly
      for (const chunk of chunks) {
        expect(text.substring(chunk.startIndex, chunk.endIndex)).toBe(chunk.text);
      }
    });

    it('should incorporate overlap correctly', () => {
      const text = 'This is a long sentence that we need to chunk with overlap.';
      const chunks = chunkText(text, 20, 10);
      
      // We expect chunks to have some overlapping text but always aligning on word boundaries.
      expect(chunks.length).toBeGreaterThan(1);
      
      for (let i = 1; i < chunks.length; i++) {
        // The start index of chunk[i] should be strictly before the end index of chunk[i-1] (due to overlap)
        expect(chunks[i].startIndex).toBeLessThan(chunks[i-1].endIndex);
      }

      // Span integrity check
      for (const chunk of chunks) {
        expect(text.substring(chunk.startIndex, chunk.endIndex)).toBe(chunk.text);
      }
    });
  });
});
