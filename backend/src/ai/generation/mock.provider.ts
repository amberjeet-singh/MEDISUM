import { AIProvider, GenerationResult } from './provider.interface';
import { AppError } from '../../utils/AppError';

export class MockSummaryProvider implements AIProvider {
    async generateSummary(systemPrompt: string, userPrompt: string): Promise<GenerationResult> {
        // Support deterministic test scenarios via magic strings in the user prompt
        if (userPrompt.includes('UNSUPPORTED_CLAIM_TEST')) {
            return {
                content: "This is a mock summary. The patient was diagnosed with an Invented Diagnosis. The patient had a routine course. Follow up in 1 week.",
                used_model: "mock-model"
            };
        }

        if (userPrompt.includes('MALFORMED_OUTPUT_TEST')) {
            // Return empty to simulate failure
            return {
                content: "",
                used_model: "mock-model"
            };
        }

        if (userPrompt.includes('PROVIDER_ERROR_TEST')) {
            throw new AppError('Simulated provider error', 502);
        }

        // Default successful deterministic output
        const outputText = "Patient presented with typical symptoms for Type 2 Diabetes Mellitus and Hypertension. They received Routine Bloodwork and were started on Lisinopril 10mg and Metformin 500mg. Patient was admitted, monitored, and stabilized. Discharged on day 3. Follow up with PCP in 2 weeks. Return to ED if symptoms worsen.";

        return {
            content: outputText,
            used_model: "mock-model"
        };
    }
}
