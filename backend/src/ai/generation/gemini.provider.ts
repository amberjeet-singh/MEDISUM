import { AIProvider, GenerationResult } from './provider.interface';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';

export class GeminiSummaryProvider implements AIProvider {
    async generateSummary(systemPrompt: string, userPrompt: string): Promise<GenerationResult> {
        if (!env.GEMINI_API_KEY) {
            throw new AppError('Gemini API key is not configured', 500);
        }

        let model = 'gemini-3.5-flash-lite';
        let url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

        // Construct the request payload for Gemini
        const payload = {
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: [{
                parts: [{ text: userPrompt }]
            }],
            generationConfig: {
                temperature: 0.2 // Low temperature for factual generation
            }
        };

        const MAX_RETRIES = 5;
        let attempt = 0;
        let lastError: Error | null = null;

        while (attempt < MAX_RETRIES) {
            attempt++;
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
                    } else if (response.status === 503) {
                        throw new AppError(`Gemini API temporarily unavailable (503): ${errorData}`, 503);
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
                const summaryText = textResponse.trim();
                
                if (!summaryText) {
                    throw new AppError('Gemini API returned an empty text response', 502);
                }

                return {
                    content: summaryText,
                    used_model: model
                };

            } catch (error: any) {
                lastError = error;
                // Only retry on 503 or 429 transient errors
                if (error instanceof AppError && (error.statusCode === 503 || error.statusCode === 429)) {
                    if (attempt < MAX_RETRIES) {
                        // Exponential backoff: 2s, 4s, 8s, 16s
                        const baseDelay = Math.pow(2, attempt) * 1000;
                        // Jitter: +/- 20%
                        const jitter = baseDelay * 0.2 * (Math.random() * 2 - 1);
                        const delayMs = Math.floor(baseDelay + jitter);
                        
                        console.warn(`[Gemini Provider] Attempt ${attempt} failed with ${error.statusCode}. Retrying in ${delayMs}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                        continue;
                    }
                }
                
                // Re-throw AppErrors if not retryable or retries exhausted
                if (error instanceof AppError) {
                    throw error;
                }
                // Handle network errors
                throw new AppError(`Network error communicating with Gemini API: ${error.message}`, 502);
            }
        }
        
        throw lastError;
    }
}
