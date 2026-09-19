export interface Chunk {
  text: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Normalizes clinical notes by replacing multiple spaces/newlines with single ones
 * and standardizing format. Returns the cleaned text, and optionally, a mapping
 * to the original text. Since we need strict source spans, any mutation that shifts 
 * length invalidates original indices. 
 * 
 * To ensure indices are strictly preserved against the source text, we simply 
 * keep the text as-is for the chunker, or if we normalize, we must calculate 
 * relative indices. For this implementation, we will keep the source text exactly 
 * as-is to guarantee 100% accurate source-span preservation.
 */
export const normalizeText = (text: string): string => {
  // We avoid destructive normalization that shifts characters (like replacing \n\n with \n)
  // because that makes span-preservation back to the original text extremely complex.
  // We just trim the ends, which is safe if we don't adjust middle characters.
  return text.trim();
};

/**
 * Splits text into chunks respecting word boundaries, up to a maximum character limit.
 * (For BioClinicalBERT, the limit is typically 512 tokens. A rough heuristic is 
 * ~4 chars per token, so max length ~2000 characters).
 * 
 * @param text The original clinical note text
 * @param maxChars Maximum characters per chunk
 * @param overlapChars Number of characters to overlap between chunks to preserve context
 */
export const chunkText = (text: string, maxChars: number = 2000, overlapChars: number = 200): Chunk[] => {
  const chunks: Chunk[] = [];
  let currentIndex = 0;
  
  if (!text) return chunks;

  while (currentIndex < text.length) {
    let endIndex = currentIndex + maxChars;

    if (endIndex >= text.length) {
      endIndex = text.length;
    } else {
      // Find the nearest space or newline to avoid cutting words
      let lastSpace = text.lastIndexOf(' ', endIndex);
      let lastNewline = text.lastIndexOf('\n', endIndex);
      
      let optimalCut = Math.max(lastSpace, lastNewline);
      
      // If no space/newline found in the boundary (very long word), just cut exactly
      if (optimalCut <= currentIndex) {
        optimalCut = endIndex;
      }
      endIndex = optimalCut;
    }

    const chunkTextStr = text.substring(currentIndex, endIndex);
    chunks.push({
      text: chunkTextStr,
      startIndex: currentIndex,
      endIndex: endIndex
    });

    if (endIndex === text.length) {
      break;
    }

    // Step back for overlap
    currentIndex = endIndex - overlapChars;
    // Fast-forward to the next space to avoid starting chunk in middle of a word
    const nextSpace = text.indexOf(' ', currentIndex);
    const nextNewline = text.indexOf('\n', currentIndex);
    
    // Pick the earliest natural break after the overlap boundary
    if (nextSpace !== -1 || nextNewline !== -1) {
      const breaks = [];
      if (nextSpace !== -1) breaks.push(nextSpace);
      if (nextNewline !== -1) breaks.push(nextNewline);
      const earliestBreak = Math.min(...breaks);
      
      // Make sure we don't step past where we just ended
      if (earliestBreak < endIndex) {
        // +1 to skip the space itself
        currentIndex = earliestBreak + 1;
      } else {
        currentIndex = endIndex;
      }
    } else {
      currentIndex = endIndex;
    }
    
    // Prevent infinite loops if overlap calculation fails
    if (currentIndex <= chunks[chunks.length - 1].startIndex) {
      currentIndex = endIndex; 
    }
  }

  return chunks;
};
