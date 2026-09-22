import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index';
import { env } from '../src/config/env';
import { GenerationService } from '../src/ai/generation/generation.service';
import { MockSummaryProvider } from '../src/ai/generation/mock.provider';
import { GeminiSummaryProvider } from '../src/ai/generation/gemini.provider';

// Mock dependencies
jest.mock('../src/config/supabase', () => ({
  checkSupabaseConnection: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
  supabase: {
    from: jest.fn<() => any>().mockReturnThis(),
    insert: jest.fn<() => any>().mockReturnThis(),
    select: jest.fn<() => any>().mockReturnThis(),
    single: jest.fn<() => Promise<any>>().mockResolvedValue({ data: { id: 'test_generated_summary_id' }, error: null })
  }
}));

jest.mock('../src/ai/extraction/extraction.service', () => {
    return {
        ExtractionService: jest.fn().mockImplementation(() => {
            return {
                extractEncounter: jest.fn<() => Promise<any>>().mockResolvedValue({
                    encounter_id: 'test_encounter_id',
                    patient_id: 'test_patient_id',
                    deterministic_metrics: {
                        age_at_encounter: 50,
                        length_of_stay_days: 3,
                        admission_date: '2020-01-01',
                        discharge_date: '2020-01-04'
                    },
                    extracted_facts: [
                        { entity_type: 'Reason', entity_value: 'hypertension', confidence: 0.9, source_note_id: 'n1' },
                        { entity_type: 'Reason', entity_value: 'hypertension', confidence: 0.8, source_note_id: 'n2' }, // duplicate
                        { entity_type: 'Reason', entity_value: 'diabetes', confidence: 0.95 },
                        { entity_type: 'Drug', entity_value: 'aspirin', confidence: 0.99 }
                    ],
                    note_corpus_size: 100
                })
            };
        })
    };
});

jest.mock('../src/services/clinicalNote.service', () => {
    return {
        ClinicalNoteService: jest.fn().mockImplementation(() => {
            return {
                getCorpusForGeneration: jest.fn<() => Promise<any>>().mockResolvedValue([{ allergies: 'Penicillin' }])
            }
        })
    }
});

// Polyfill global fetch for Gemini tests
global.fetch = jest.fn() as any;

describe('Generation API and Providers', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('Mock Provider should generate deterministic output without Gemini API key', async () => {
        env.USE_MOCK_AI = true;
        const provider = new MockSummaryProvider();
        
        const summary = await provider.generateSummary("system", "normal user prompt");
        
        expect(summary.summary_content).toBeDefined();
        expect(summary.diagnoses.includes("Hypertension")).toBe(true);
        expect(summary.metadata?.mock).toBe(true);
    });

    it('Mock Provider should support deterministic unsupported claims test', async () => {
        const provider = new MockSummaryProvider();
        const summary = await provider.generateSummary("system", "test UNSUPPORTED_CLAIM_TEST");
        expect(summary.diagnoses).toContain("Invented Diagnosis");
        expect(summary.metadata?.type).toBe("unsupported");
    });

    it('Generation endpoint should return 200 with mock provider', async () => {
        env.USE_MOCK_AI = true;
        const res = await request(app)
            .post('/api/v1/encounters/123e4567-e89b-12d3-a456-426614174000/generate-summary');
            
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.summary_content).toBeDefined();
    });

    it('Generation endpoint should select GeminiSummaryProvider when USE_MOCK_AI=false', async () => {
        env.USE_MOCK_AI = false;
        env.GEMINI_API_KEY = 'TEST_KEY';

        const mockResponse = {
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify({
                            summary_content: "Gemini provider invoked through endpoint",
                            diagnoses: ["A"],
                            procedures: ["B"],
                            medications: ["C"],
                            hospital_course: "Course",
                            follow_up_instructions: "Follow up"
                        })
                    }]
                }
            }]
        };

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const res = await request(app)
            .post('/api/v1/encounters/123e4567-e89b-12d3-a456-426614174000/generate-summary');
            
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.summary_content).toBe("Gemini provider invoked through endpoint");
        
        // Extract the payload sent to fetch to verify prompt compaction
        expect(global.fetch).toHaveBeenCalled();
        const fetchArgs = (global.fetch as jest.Mock).mock.calls[0];
        const requestPayload = JSON.parse((fetchArgs[1] as any).body as string);
        const userPrompt = requestPayload.contents[0].parts[0].text;
        
        // Assert that the compacted facts structure is present
        expect(userPrompt).toContain('"Reason": [\n    "hypertension",\n    "diabetes"\n  ]');
        expect(userPrompt).toContain('"Drug": [\n    "aspirin"\n  ]');
        
        // Ensure atomic rows' metadata is removed (these words shouldn't exist in the grouped output)
        expect(userPrompt).not.toContain('entity_type');
        expect(userPrompt).not.toContain('entity_value');
        expect(userPrompt).not.toContain('confidence');
        expect(userPrompt).not.toContain('source_note_id');
        expect(userPrompt).not.toContain('n1');
        
        // Ensure deterministic metrics and source notes are still included
        expect(userPrompt).toContain('Age: 50');
        expect(userPrompt).toContain('Penicillin');
    });

    it('Gemini Provider should throw error if API key is missing', async () => {
        env.USE_MOCK_AI = false;
        env.GEMINI_API_KEY = ''; // Clear it

        const provider = new GeminiSummaryProvider();
        await expect(provider.generateSummary("sys", "usr")).rejects.toThrow("Gemini API key is not configured");
    });

    it('Gemini Provider should successfully parse valid JSON from mock API response', async () => {
        env.USE_MOCK_AI = false;
        env.GEMINI_API_KEY = 'TEST_KEY';

        const mockResponse = {
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify({
                            summary_content: "Real gemini summary",
                            diagnoses: ["A"],
                            procedures: ["B"],
                            medications: ["C"],
                            hospital_course: "Course",
                            follow_up_instructions: "Follow up"
                        })
                    }]
                }
            }]
        };

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const provider = new GeminiSummaryProvider();
        const summary = await provider.generateSummary("sys", "usr");

        expect(global.fetch).toHaveBeenCalled();
        expect(summary.summary_content).toBe("Real gemini summary");
        expect(summary.diagnoses).toEqual(["A"]);
    });

    it('Gemini Provider should reject invalid JSON structure from API', async () => {
        env.USE_MOCK_AI = false;
        env.GEMINI_API_KEY = 'TEST_KEY';

        const mockResponse = {
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify({
                            invalid_key: "This is missing required schema fields"
                        })
                    }]
                }
            }]
        };

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const provider = new GeminiSummaryProvider();
        await expect(provider.generateSummary("sys", "usr")).rejects.toThrow(/does not match the required schema/);
    });
});
