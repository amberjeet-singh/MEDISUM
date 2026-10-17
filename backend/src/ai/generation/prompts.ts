export const PROMPT_VERSION_V1 = 'v1.0';

export const getSystemPrompt = (): string => {
    return `You are an expert medical AI assistant specialized in writing clinical discharge summaries.
Your objective is to generate a structured, accurate, and concise discharge summary based STRICTLY on the provided clinical context.

CRITICAL INSTRUCTIONS:
1. DO NOT INVENT FACTS. You must only use the information explicitly provided in the user's clinical context.
2. DO NOT make unsupported medical assumptions.
3. Use the deterministic demographic and encounter metrics (Patient Age, Length of Stay, Admission Date, Discharge Date) exactly as provided. Do not recalculate them yourself. Do not replace valid supplied values with "Not specified".
4. Include them in the final discharge summary as plain readable text paragraphs.
5. If a specific section (e.g., procedures, medications) has no information in the source text, leave it out or state "No information provided". Preserve uncertainty.
6. Generate a concise clinical discharge summary in normal readable paragraphs.
7. Do NOT output JSON. Do NOT output markdown tables. Do NOT output labels such as "summary_content:".
8. Preserve medically important details.
8. Include diagnoses, procedures, medications, hospital course, and follow-up when those facts are present.
9. Do not mention unavailable information as if it were known.
`;
};

export const buildUserPrompt = (context: any): string => {
    const formatValue = (val: any, suffix: string) => val != null ? `${val} ${suffix}`.trim() : 'Not specified';
    const formatDate = (val: any) => val ? new Date(val).toISOString().split('T')[0] : 'Not specified';

    return `Generate a discharge summary for the following clinical context.

### Patient & Encounter Data
Patient Age: ${formatValue(context.deterministicMetrics.age_at_encounter, 'years')}
Admission Date: ${formatDate(context.deterministicMetrics.admission_date)}
Discharge Date: ${formatDate(context.deterministicMetrics.discharge_date)}
Length of Stay: ${formatValue(context.deterministicMetrics.length_of_stay_days, 'days')}

### Extracted Clinical Facts (NER)
${JSON.stringify(context.facts, null, 2)}

### Source Clinical Notes
${JSON.stringify(context.notes, null, 2)}
`;
};
