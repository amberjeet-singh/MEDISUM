import { AIProvider } from './provider.interface';
import { NormalizedSummaryOutput, NormalizedSummaryOutputSchema } from '../../schemas/generation.schema';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';

export class GeminiSummaryProvider implements AIProvider {
    async generateSummary(systemPrompt: string, userPrompt: string): Promise<NormalizedSummaryOutput> {
        if (!env.GEMINI_API_KEY) {
            throw new AppError('Gemini API key is not configured', 500);
        }

        const model = 'gemini-3.8-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

        // Construct the request payload for Gemini
        const payload = {
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: [{
                parts: [{ text: userPrompt }]
            }],
            generationConfig: {
                temperature: 0.2, // Low temperature for factual generation
                response_mime_type: "application/json"
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.text();
                
                if (response.status === 429) {
                    throw new AppError(`Gemini API rate limit exceeded: ${errorData}`, 429);
                } else if (response.status === 401 || response.status === 403) {
                    throw new AppError(`Gemini API authentication failed: ${errorData}`, 401);
                }
                
                throw new AppError(`Gemini API error (${response.status}): ${errorData}`, 502);
            }

            const data = await response.json();
            const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) {
                throw new AppError('Gemini API returned an empty or malformed text response', 502);
            }

            // Parse the JSON string from Gemini
            let parsedJson;
            try {
                parsedJson = JSON.parse(textResponse);
            } catch (e) {
                throw new AppError('Gemini API did not return valid JSON', 502);
            }

            // Validate against the shared schema
            const validatedOutput = NormalizedSummaryOutputSchema.parse(parsedJson);
            return validatedOutput;

        } catch (error: any) {
            // Re-throw AppErrors (like validation errors from Zod or explicitly thrown errors)
            if (error instanceof AppError) {
                throw error;
            }
            if (error.name === 'ZodError') {
                throw new AppError(`Gemini API returned JSON that does not match the required schema: ${error.message}`, 502);
            }
            // Handle network errors (e.g. fetch timeout, connection refused)
            throw new AppError(`Network error communicating with Gemini API: ${error.message}`, 502);
        }
    }
}
