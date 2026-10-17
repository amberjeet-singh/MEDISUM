import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import type { ExtractedFact, GeneratedSummary } from '../types';
import { Activity, Play, CheckCircle2 } from 'lucide-react';

export const ConsultationWorkspace: React.FC = () => {
    const { encounterId } = useParams<{ encounterId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const initialStep = parseInt(searchParams.get('step') || '1') as 1 | 2 | 3;
    const [step, setStep] = useState<1 | 2 | 3>(initialStep); // 1: Notes, 2: Extraction, 3: Summary
    
    // Step 1 State
    const [roughNotes, setRoughNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    
    // Step 2 State
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedFacts, setExtractedFacts] = useState<ExtractedFact[]>([]);
    
    // Step 3 State
    const [isGenerating, setIsGenerating] = useState(false);
    const [summary, setSummary] = useState<GeneratedSummary | null>(null);

    const [error, setError] = useState<string | null>(null);

    const handleSubmitNotes = async () => {
        if (!encounterId) return;
        if (!roughNotes.trim()) {
            setError("Consultation notes cannot be empty.");
            return;
        }

        setError(null);
        setIsSavingNotes(true);
        try {
            // 1. Save Notes
            await api.saveConsultationNotes(encounterId, roughNotes);
            
            // 2. Do NOT trigger extraction. Return to patients list.
            alert("Patient added successfully");
            navigate('/dashboard');
            
        } catch (err: any) {
            setError(err.message || 'Failed to process consultation.');
            setIsSavingNotes(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (!encounterId) return;
        
        setError(null);
        setIsGenerating(true);
        try {
            const result = await api.generateSummary(encounterId);
            setSummary(result);
            setStep(3);
        } catch (err: any) {
            setError('Summary generation failed. Please retry.');
            console.error('Gemini error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        // If we landed directly on step 2, auto-trigger extraction
        if (initialStep === 2 && !isExtracting && extractedFacts.length === 0) {
            const autoExtract = async () => {
                if (!encounterId) return;
                setIsExtracting(true);
                try {
                    const facts = await api.extractEncounter(encounterId);
                    setExtractedFacts(facts || []);
                } catch (err: any) {
                    setError(err.message || 'Failed to extract facts.');
                } finally {
                    setIsExtracting(false);
                }
            };
            autoExtract();
        }
    }, [initialStep, encounterId]);

    // Helper to group facts by fact_type
    // Helper to group facts by fact_type safely
    const groupedFacts = (extractedFacts || []).reduce((acc, fact) => {
        if (!acc[fact.fact_type]) acc[fact.fact_type] = [];
        acc[fact.fact_type].push(fact);
        return acc;
    }, {} as Record<string, ExtractedFact[]>);

    return (
        <div className="fade-in">
            <h1 className="page-title">Consultation Workspace</h1>
            <p className="page-subtitle">Enter rough clinical notes, extract structured data, and generate a final discharge summary.</p>
            
            {error && <div className="alert alert-error">{error}</div>}

            {/* STEP 1: Rough Notes Input (Only shown if step is 1) */}
            {step === 1 && (
                <div className="card fade-in">
                    <h2 className="section-title">Step 1: Clinical Rough Notes</h2>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                        Enter all clinical information together as free text. The Medisum AI will automatically extract and structure the relevant facts.
                    </p>
                    
                    <div className="form-group">
                        <textarea 
                            className="form-textarea" 
                            placeholder="e.g.&#10;ALLERGIES: No Known Allergies&#10;CHIEF COMPLAINT: Abdominal Pain&#10;HISTORY OF PRESENT ILLNESS: Patient is a 45yo female..."
                            value={roughNotes}
                            onChange={(e) => setRoughNotes(e.target.value)}
                            disabled={isSavingNotes}
                        />
                    </div>
                    
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSubmitNotes}
                        disabled={isSavingNotes || roughNotes.trim().length === 0}
                    >
                        {isSavingNotes ? (
                            <><div className="loading-spinner" style={{width: 16, height: 16, borderWidth: 2}}></div> Processing...</>
                        ) : (
                            <><Activity size={16} /> Process Consultation</>
                        )}
                    </button>
                </div>
            )}

            {/* STEP 2: Extraction Results */}
            {step === 2 && (
                <div className="fade-in">
                    {initialStep === 2 && (
                        <div className="alert fade-in" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid rgba(15, 98, 254, 0.2)' }}>
                            <CheckCircle2 size={20} />
                            <span><strong>Existing Clinical Notes Found.</strong> Skipping rough-notes input and extracting facts directly.</span>
                        </div>
                    )}

                    <div className="card" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>Step 2: Structured Extracted Facts</h2>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                    BioClinicalBERT has extracted {extractedFacts.length} atomic facts from your notes.
                                </p>
                            </div>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleGenerateSummary}
                                disabled={isGenerating || isExtracting}
                            >
                                {isGenerating ? (
                                    <><div className="loading-spinner" style={{width: 16, height: 16, borderWidth: 2}}></div> Generating Summary...</>
                                ) : (
                                    <><Play size={16} /> Generate Discharge Summary</>
                                )}
                            </button>
                        </div>
                    </div>

                    {isExtracting ? (
                        <div className="loading-container card fade-in">
                            <div className="loading-spinner"></div>
                            <div>Extracting clinical facts via BioClinicalBERT...</div>
                        </div>
                    ) : (
                        <div className="fact-grid fade-in">
                            {Object.entries(groupedFacts).map(([factType, facts]) => (
                                <div key={factType} className="fact-group">
                                    <div className="fact-group-header">
                                        {factType}
                                        <span className="badge badge-neutral" style={{ float: 'right' }}>{facts.length}</span>
                                    </div>
                                    <ul className="fact-list">
                                        {facts.map(fact => (
                                            <li key={fact.id} className="fact-item">
                                                <div className="fact-value">{fact.fact_value}</div>
                                                <div className="fact-key">{fact.fact_key}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* STEP 3: Generated Summary */}
            {step === 3 && summary && (
                <div className="fade-in">
                    <div className="card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-success-light)', borderColor: 'var(--color-success)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle2 color="var(--color-success)" size={24} />
                            <div>
                                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-success)', margin: 0 }}>Summary Generated Successfully</h2>
                                <p style={{ fontSize: '13px', color: 'var(--color-success)', marginTop: '2px', opacity: 0.8 }}>
                                    Model: {summary.model_provider}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="summary-content fade-in">
                        {summary.content}
                    </div>
                </div>
            )}
        </div>
    );
};
