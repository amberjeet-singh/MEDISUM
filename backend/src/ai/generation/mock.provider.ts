import { AIProvider } from './provider.interface';
import { NormalizedSummaryOutput, NormalizedSummaryOutputSchema } from '../../schemas/generation.schema';
import { AppError } from '../../utils/AppError';

export class MockSummaryProvider implements AIProvider {
    async generateSummary(systemPrompt: string, userPrompt: string): Promise<NormalizedSummaryOutput> {
        // Support deterministic test scenarios via magic strings in the user prompt
        if (userPrompt.includes('UNSUPPORTED_CLAIM_TEST')) {
            return {
                summary_content: "This is a mock summary.",
                diagnoses: ["Invented Diagnosis"], // Simulates a hallucinated/unsupported claim
                procedures: [],
                medications: [],
                hospital_course: "The patient had a routine course.",
                follow_up_instructions: "Follow up in 1 week.",
                metadata: { mock: true, type: "unsupported" }
            };
        }

        if (userPrompt.includes('MALFORMED_OUTPUT_TEST')) {
            // Return an intentionally malformed object that would fail Zod validation
            // We cast it as any to bypass TS for the mock test
            return {
                summary_content: "This is missing fields",
                // missing diagnoses, procedures, etc.
            } as any;
        }

        if (userPrompt.includes('PROVIDER_ERROR_TEST')) {
            throw new AppError('Simulated provider error', 502);
        }

        // Default successful deterministic output
        const output = {
            summary_content: "Patient presented with typical symptoms. Course was uncomplicated.",
            diagnoses: ["Type 2 Diabetes Mellitus", "Hypertension"],
            procedures: ["Routine Bloodwork"],
            medications: ["Lisinopril 10mg", "Metformin 500mg"],
            hospital_course: "Patient was admitted, monitored, and stabilized. Discharged on day 3.",
            follow_up_instructions: "Follow up with PCP in 2 weeks. Return to ED if symptoms worsen.",
            metadata: { mock: true, type: "success" }
        };

        // Ensure our default mock output actually adheres to the schema we defined
        return NormalizedSummaryOutputSchema.parse(output);
    }
}
