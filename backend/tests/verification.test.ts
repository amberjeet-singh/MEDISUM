import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/index';
import { supabase } from '../src/config/supabase';

import { EncounterRepository } from '../src/repositories/encounter.repository';
import { PatientRepository } from '../src/repositories/patient.repository';
import { ClinicalNoteRepository } from '../src/repositories/clinicalNote.repository';
import { ExtractedFactRepository } from '../src/repositories/extractedFact.repository';
import { GeneratedSummaryRepository } from '../src/repositories/generatedSummary.repository';
import { ClaimRepository } from '../src/repositories/claim.repository';
import { EvidenceRepository } from '../src/repositories/evidence.repository';
import { VerificationResultRepository } from '../src/repositories/verificationResult.repository';
import { SourceFactCoverageRepository } from '../src/repositories/sourceFactCoverage.repository';

// Mock child_process.spawn to avoid real python ML during tests
jest.mock('child_process', () => {
    const original = jest.requireActual('child_process');
    return {
        ...(original as object),
        spawn: jest.fn(() => {
            const EventEmitter = require('events');
            const mockProcess: any = new EventEmitter();
            
            mockProcess.stdout = new EventEmitter();
            mockProcess.stderr = new EventEmitter();
            mockProcess.stdin = {
                write: jest.fn(),
                end: jest.fn()
            };

            // Simulate immediate successful python output
            process.nextTick(() => {
                const mockOutput = {
                    success: true,
                    claims: [
                        {
                            claim_id: "claim_0",
                            claim_text: "Patient has a history of diabetes.",
                            evidence: [{
                                source_note_id: "fake-note-id",
                                source_chunk_id: "chunk_0",
                                evidence_text: "Pt with type 2 diabetes mellitus.",
                                similarity_score: 0.85,
                                rank: 1
                            }],
                            nli_label: "entailment",
                            nli_confidence: 0.95,
                            similarity_score: 0.85,
                            status: "SUPPORTED"
                        },
                        {
                            claim_id: "claim_1",
                            claim_text: "No known allergies.",
                            evidence: [{
                                source_note_id: "fake-note-id",
                                source_chunk_id: "chunk_0",
                                evidence_text: "Allergies: Penicillin (hives).",
                                similarity_score: 0.75,
                                rank: 1
                            }],
                            nli_label: "contradiction",
                            nli_confidence: 0.88,
                            similarity_score: 0.75,
                            status: "CONTRADICTED"
                        }
                    ],
                    coverage: [
                        {
                            source_fact_id: "fake-fact-id-1",
                            status: "OMITTED",
                            coverage_score: 0.4,
                            nli_label: "neutral",
                            nli_confidence: 0.8,
                            reason: "Not entailed by any summary sentence."
                        },
                        {
                            source_fact_id: "fake-fact-id-2",
                            status: "COVERED",
                            coverage_score: 0.9,
                            nli_label: "entailment",
                            nli_confidence: 0.99,
                            reason: "Fully entailed."
                        }
                    ],
                    error: null
                };
                mockProcess.stdout.emit('data', Buffer.from(JSON.stringify(mockOutput)));
                mockProcess.emit('close', 0);
            });

            return mockProcess;
        })
    };
});

describe('Task 6 - Verification API', () => {
    let testSummaryId = "test_summary_123";
    let testEncounterId = "test_encounter_123";
    
    beforeAll(() => {
        // Setup repository mocks
        jest.spyOn(GeneratedSummaryRepository.prototype, 'findById').mockResolvedValue({
            id: testSummaryId,
            encounter_id: testEncounterId,
            content: JSON.stringify({ claim_extraction_text: "Patient has a history of diabetes. No known allergies." })
        } as any);
        jest.spyOn(EncounterRepository.prototype, 'findById').mockResolvedValue({
            id: testEncounterId,
            patient_id: 'test_patient',
            admission_datetime: '2020-01-01T00:00:00Z',
            discharge_datetime: '2020-01-04T00:00:00Z'
        } as any);
        jest.spyOn(PatientRepository.prototype, 'findById').mockResolvedValue({
            id: 'test_patient',
            date_of_birth: '1970-01-01'
        } as any);
        jest.spyOn(ClinicalNoteRepository.prototype, 'findByEncounterId').mockResolvedValue([
            { id: 'note1', chunk_index: 0, text: 'Pt with type 2 diabetes mellitus. Allergies: Penicillin (hives).' }
        ] as any);
        jest.spyOn(ExtractedFactRepository.prototype, 'findByEncounterId').mockResolvedValue([
            { id: 'fact1', fact_type: 'Disease', fact_value: 'diabetes' },
            { id: 'fact2', fact_type: 'Allergy', fact_value: 'Penicillin' }
        ] as any);
        
        jest.spyOn(ClaimRepository.prototype, 'create').mockImplementation(async (data: any) => ({ ...data, id: 'claim1' }) as any);
        jest.spyOn(VerificationResultRepository.prototype, 'create').mockImplementation(async (data: any) => ({ ...data, id: 'ver1' }) as any);
        jest.spyOn(EvidenceRepository.prototype, 'create').mockImplementation(async (data: any) => ({ ...data, id: 'ev1' }) as any);
        jest.spyOn(SourceFactCoverageRepository.prototype, 'create').mockImplementation(async (data: any) => ({ ...data, id: 'cov1' }) as any);
    });

    it('should verify a summary using mocked offline models without calling Gemini', async () => {
        if (!testSummaryId) return;

        const res = await request(app)
            .post(`/api/v1/summaries/${testSummaryId}/verify`)
            .send();

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.metadata).toBeDefined();
        
        // Assert Claims separation
        expect(res.body.data.claims).toBeDefined();
        expect(res.body.data.claims.supported.length).toBeGreaterThanOrEqual(1);
        expect(res.body.data.claims.contradicted.length).toBeGreaterThanOrEqual(1);

        // Assert Coverage separation
        expect(res.body.data.source_fact_coverage).toBeDefined();
        expect(res.body.data.source_fact_coverage.covered.length).toBeGreaterThanOrEqual(1);
        expect(res.body.data.source_fact_coverage.omitted.length).toBeGreaterThanOrEqual(1);
        
        // Ensure no status cross-contamination
        const supportedClaim = res.body.data.claims.supported[0].verification.status;
        expect(supportedClaim).toBe("SUPPORTED");
        
        const omittedCoverage = res.body.data.source_fact_coverage.omitted[0].status;
        expect(omittedCoverage).toBe("OMITTED");

        // Deterministic Checks
        expect(res.body.data.deterministic_checks).toBeDefined();
        expect(res.body.data.deterministic_checks.age).toBeDefined();
    });
});
