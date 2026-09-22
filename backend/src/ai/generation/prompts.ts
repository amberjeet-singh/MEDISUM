export const PROMPT_VERSION_V1 = 'v1.0';

export const getSystemPrompt = (): string => {
    return `You are an expert medical AI assistant specialized in writing clinical discharge summaries.
Your objective is to generate a structured, accurate, and concise discharge summary based STRICTLY on the provided clinical context.

CRITICAL INSTRUCTIONS:
1. DO NOT INVENT FACTS. You must only use the information explicitly provided in the user's clinical context.
2. DO NOT make unsupported medical assumptions.
3. Use the deterministic demographic and encounter metrics (Age, Length of Stay, Admission/Discharge Dates) exactly as provided. Do not calculate them yourself.
4. If a specific section (e.g., procedures, medications) has no information in the source text, leave it out or state "No information provided". Preserve uncertainty.
5. Generate a concise clinical discharge summary in normal readable paragraphs.
6. Do NOT output JSON. Do NOT output markdown tables. Do NOT output labels such as "summary_content:".
7. Preserve medically important details.
8. Include diagnoses, procedures, medications, hospital course, and follow-up when those facts are present.
9. Do not mention unavailable information as if it were known.
`;
};

export const buildUserPrompt = (context: any): string => {
    return `Generate a discharge summary for the following clinical context.

### Patient & Encounter Data
Age: ${context.deterministicMetrics.age_at_encounter}
Admission Date: ${context.deterministicMetrics.admission_date}
Discharge Date: ${context.deterministicMetrics.discharge_date}
Length of Stay (Days): ${context.deterministicMetrics.length_of_stay_days}

### Extracted Clinical Facts (NER)
${JSON.stringify(context.facts, null, 2)}

### Source Clinical Notes
${JSON.stringify(context.notes, null, 2)}
`;
};
