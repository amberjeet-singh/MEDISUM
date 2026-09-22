/**
 * Deterministic claim extractor.
 * We must not use Gemini for this part of Task 6.
 * This takes a generated summary and splits it deterministically into atomic claims (sentences/clauses).
 */
export class ClaimExtractor {
    /**
     * Splits text into sentences deterministically.
     * Preserves original wording and handles simple sentence boundaries.
     */
    static extractClaims(text: string): { text: string; startIndex: number; endIndex: number }[] {
        if (!text) return [];
        
        const claims: { text: string; startIndex: number; endIndex: number }[] = [];
        const regex = /[^.!?]+[.!?]+/g;
        let match;
        
        // Find all matches for the regex to get exact indices
        while ((match = regex.exec(text)) !== null) {
            const rawClaim = match[0];
            const trimmedClaim = rawClaim.trim();
            if (trimmedClaim.length > 0) {
                // Determine actual start index accounting for whitespace trimming
                const offset = rawClaim.indexOf(trimmedClaim);
                const startIndex = match.index + offset;
                const endIndex = startIndex + trimmedClaim.length;
                claims.push({ text: trimmedClaim, startIndex, endIndex });
            }
        }
        
        if (claims.length === 0) {
            // If no punctuation found, just return the whole text as one claim
            const trimmed = text.trim();
            if (trimmed.length > 0) {
                const offset = text.indexOf(trimmed);
                claims.push({ text: trimmed, startIndex: offset, endIndex: offset + trimmed.length });
            }
        }

        return claims;
    }
}
