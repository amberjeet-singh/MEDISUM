
export interface GenerationContext {
    patient: any;
    encounter: any;
    notes: any[];
    facts: any;
    deterministicMetrics: any;
}

export interface GenerationResult {
    content: string;
    used_model: string;
}

export interface AIProvider {
    /**
     * Generates a discharge summary based on the provided context and instructions.
     * @param systemPrompt The system instructions.
     * @param userPrompt The user prompt containing the context.
     */
    generateSummary(systemPrompt: string, userPrompt: string): Promise<GenerationResult>;
}
