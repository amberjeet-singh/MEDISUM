import { spawn } from 'child_process';
import path from 'path';
import { AppError } from '../../utils/AppError';
import { ClaimExtractor } from './claim_extractor';
import { EncounterRepository } from '../../repositories/encounter.repository';
import { ClinicalNoteRepository } from '../../repositories/clinicalNote.repository';
import { ExtractedFactRepository } from '../../repositories/extractedFact.repository';
import { GeneratedSummaryRepository } from '../../repositories/generatedSummary.repository';
import { ClaimRepository } from '../../repositories/claim.repository';
import { EvidenceRepository } from '../../repositories/evidence.repository';
import { VerificationResultRepository } from '../../repositories/verificationResult.repository';
import { SourceFactCoverageRepository } from '../../repositories/sourceFactCoverage.repository';
import { PythonVerificationOutputSchema } from '../../schemas/verification.schema';
import { calculateAge, calculateLengthOfStay } from '../../utils/clinicalCalculators';
import { PatientRepository } from '../../repositories/patient.repository';

export class VerificationService {
    private encounterRepo = new EncounterRepository();
    private patientRepo = new PatientRepository();
    private noteRepo = new ClinicalNoteRepository();
    private factRepo = new ExtractedFactRepository();
    private summaryRepo = new GeneratedSummaryRepository();
    
    private claimRepo = new ClaimRepository();
    private evidenceRepo = new EvidenceRepository();
    private verificationResultRepo = new VerificationResultRepository();
    private sourceFactCoverageRepo = new SourceFactCoverageRepository();

    async verifySummary(summaryId: string) {
        const summary = await this.summaryRepo.findById(summaryId);
        if (!summary) throw new AppError('Generated summary not found', 404);

        const encounter = await this.encounterRepo.findById(summary.encounter_id);
        if (!encounter) throw new AppError('Encounter not found', 404);

        const patient = await this.patientRepo.findById(encounter.patient_id);

        const allNotes = await this.noteRepo.findByEncounterId(summary.encounter_id);
        const extractedFacts = await this.factRepo.findByEncounterId(summary.encounter_id);

        // 1. Deterministic Claim Extraction
        // Parse the generated summary content to find claim_extraction_text
        let claimExtractionText = "";
        try {
            const parsedContent = JSON.parse(summary.content);
            claimExtractionText = parsedContent.claim_extraction_text || "";
        } catch (e) {
            claimExtractionText = summary.content; // fallback
        }

        const rawClaims = ClaimExtractor.extractClaims(claimExtractionText);
        
        // 2. Prepare payload for Python ML Verifier
        const payload = {
            claims: rawClaims.map((c, idx) => ({ id: `claim_${idx}`, text: c.text })),
            clinical_notes: allNotes.map(n => ({
                source_note_id: n.id,
                chunk_id: `chunk_${n.chunk_index}`,
                text: this.getNoteText(n),
                startIndex: 0,
                endIndex: this.getNoteText(n).length
            })),
            extracted_facts: extractedFacts.map(f => ({
                id: f.id,
                fact_type: f.fact_type,
                fact_value: f.fact_value
            })),
            summary_sentences: rawClaims.map(c => c.text),
            retrieval_threshold: 0.5,
            top_k: 3,
            nli_threshold: 0.6
        };

        // 3. Execute Python Verifier
        const mlResults = await this.executePythonVerifier(payload);
        if (!mlResults.success) {
            throw new AppError(`ML Verification failed: ${mlResults.error}`, 500);
        }

        // 4. Deterministic Age/Date/LOS
        const deterministic_checks = this.runDeterministicChecks(claimExtractionText, patient, encounter);

        // 5. Persist Results
        const runId = `run_${Date.now()}`;
        
        const claimResults = {
            all: [] as any[],
            supported: [] as any[],
            contradicted: [] as any[],
            not_found: [] as any[]
        };

        if (mlResults.claims) {
            for (let i = 0; i < mlResults.claims.length; i++) {
                const c = mlResults.claims[i];
                const rawClaim = rawClaims[i];

                // Insert Claim
                const insertedClaim = await this.claimRepo.create({
                    summary_id: summary.id,
                    claim_order: i,
                    claim_text: c.claim_text,
                    claim_type: 'extracted',
                    source_start_index: rawClaim.startIndex,
                    source_end_index: rawClaim.endIndex
                });

                // Insert Verification Result
                await this.verificationResultRepo.create({
                    claim_id: insertedClaim.id,
                    status: c.status,
                    nli_label: c.nli_label,
                    confidence: c.nli_confidence,
                    reason: c.reason || null,
                    verifier_model: 'DeBERTa-v3-base-mnli-fever-anli',
                    verifier_version: 'local'
                });

                // Insert Evidence
                const evidenceList = [];
                if (c.evidence) {
                    for (const ev of c.evidence) {
                        const insertedEvidence = await this.evidenceRepo.create({
                            claim_id: insertedClaim.id,
                            note_id: ev.source_note_id || allNotes[0]?.id, // fallback if missing
                            evidence_text: ev.evidence_text,
                            source_start_index: ev.source_start_index || null,
                            source_end_index: ev.source_end_index || null,
                            similarity_score: ev.similarity_score,
                            rank: ev.rank
                        });
                        evidenceList.push(insertedEvidence);
                    }
                }

                const fullClaim = { claim: insertedClaim, verification: c, evidence: evidenceList };
                claimResults.all.push(fullClaim);
                if (c.status === 'SUPPORTED') claimResults.supported.push(fullClaim);
                else if (c.status === 'CONTRADICTED') claimResults.contradicted.push(fullClaim);
                else claimResults.not_found.push(fullClaim);
            }
        }

        const coverageResults = {
            all: [] as any[],
            covered: [] as any[],
            omitted: [] as any[],
            uncertain: [] as any[]
        };

        if (mlResults.coverage) {
            for (const cov of mlResults.coverage) {
                const insertedCov = await this.sourceFactCoverageRepo.create({
                    summary_id: summary.id,
                    fact_id: cov.source_fact_id,
                    status: cov.status,
                    coverage_score: cov.coverage_score,
                    nli_label: cov.nli_label,
                    confidence: cov.nli_confidence,
                    reason: cov.reason || null,
                    verifier_model: 'DeBERTa-v3-base-mnli-fever-anli',
                    verifier_version: 'local'
                });
                
                coverageResults.all.push(insertedCov);
                if (cov.status === 'COVERED') coverageResults.covered.push(insertedCov);
                else if (cov.status === 'OMITTED') coverageResults.omitted.push(insertedCov);
                else coverageResults.uncertain.push(insertedCov);
            }
        }

        return {
            summary,
            claims: claimResults,
            deterministic_checks,
            source_fact_coverage: coverageResults,
            metadata: {
                verification_run_id: runId,
                models: {
                    retrieval: 'BAAI/bge-base-en-v1.5',
                    nli: 'MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli'
                },
                thresholds: {
                    retrieval_threshold: 0.5,
                    nli_threshold: 0.6
                },
                timestamp: new Date().toISOString()
            }
        };
    }

    private getNoteText(n: any): string {
        return [
            n.allergies, n.history_of_present_illness, n.past_medical_history, 
            n.social_history, n.family_history, n.physical_exam, 
            n.pertinent_results, n.medications_on_admission, n.discharge_medications
        ].filter(Boolean).join('\n');
    }

    private runDeterministicChecks(summaryText: string, patient: any, encounter: any) {
        const checks = {
            age: [] as string[],
            dates: [] as string[],
            length_of_stay: [] as string[]
        };

        if (patient?.date_of_birth) {
            const trueAge = calculateAge(patient.date_of_birth);
            if (!summaryText.includes(trueAge.toString())) {
                checks.age.push(`Age mismatch: Expected ${trueAge} not found in summary text.`);
            } else {
                checks.age.push(`Age Match: ${trueAge}`);
            }
        }

        if (encounter?.admission_datetime && encounter?.discharge_datetime) {
            const los = calculateLengthOfStay(encounter.admission_datetime, encounter.discharge_datetime);
            if (!summaryText.includes(los.toString())) {
                checks.length_of_stay.push(`LOS mismatch: Expected ${los} days not found in summary text.`);
            } else {
                checks.length_of_stay.push(`LOS Match: ${los} days`);
            }
        }

        return checks;
    }

    private executePythonVerifier(payload: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', [path.join(__dirname, 'verifier.py')], {
                env: { ...process.env, HF_HUB_OFFLINE: '1' }
            });
            
            let outputData = '';
            let errorData = '';

            pythonProcess.stdout.on('data', (data) => { outputData += data.toString(); });
            pythonProcess.stderr.on('data', (data) => { errorData += data.toString(); });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error("Python ML Verifier stderr:", errorData);
                    return resolve({ success: false, error: `Python process exited with code ${code}` });
                }
                
                try {
                    const parsed = JSON.parse(outputData);
                    const validated = PythonVerificationOutputSchema.safeParse(parsed);
                    if (!validated.success) {
                        return resolve({ success: false, error: 'Invalid output format from Python ML Verifier' });
                    }
                    resolve(validated.data);
                } catch (e) {
                    resolve({ success: false, error: 'Failed to parse JSON from Python ML Verifier' });
                }
            });

            pythonProcess.stdin.write(JSON.stringify(payload));
            pythonProcess.stdin.end();
        });
    }
}
