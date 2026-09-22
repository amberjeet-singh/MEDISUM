import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { Patient, Encounter, ExtractedFact } from '../types';
import { Search, AlertCircle } from 'lucide-react';

export const ExtractedSummary: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const [encounters, setEncounters] = useState<Encounter[]>([]);
    const [loadingEncounters, setLoadingEncounters] = useState(false);
    const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);

    const [isCheckingNotes, setIsCheckingNotes] = useState(false);
    const [hasNotes, setHasNotes] = useState<boolean | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [processStatus, setProcessStatus] = useState<'idle' | 'success'>('idle');
    const [extractedFacts, setExtractedFacts] = useState<ExtractedFact[]>([]);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationSuccess, setGenerationSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const groupedFacts = (extractedFacts || []).reduce((acc, fact: ExtractedFact) => {
        if (!acc[fact.fact_type]) acc[fact.fact_type] = [];
        acc[fact.fact_type].push(fact);
        return acc;
    }, {} as Record<string, ExtractedFact[]>);

    // 1. Fetch Patients on Mount
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await api.getPatients(1, 50);
                setPatients(data.data || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load patients.');
            } finally {
                setLoadingPatients(false);
            }
        };
        fetchPatients();
    }, []);

    // 2. Fetch Encounters when Patient selected
    const handleSelectPatient = async (patient: Patient) => {
        setSelectedPatient(patient);
        setSelectedEncounter(null);
        setHasNotes(null);
        setProcessStatus('idle');
        setGenerationSuccess(false);
        setError(null);
        
        setLoadingEncounters(true);
        try {
            const data = await api.getPatientEncounters(patient.id, 1, 50);
            setEncounters(data.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load encounters.');
        } finally {
            setLoadingEncounters(false);
        }
    };

    // 3. Select Encounter, check notes, and start extraction
    const handleSelectEncounter = async (encounter: Encounter) => {
        setSelectedEncounter(encounter);
        setHasNotes(null);
        setProcessStatus('idle');
        setGenerationSuccess(false);
        setError(null);
        
        setIsCheckingNotes(true);
        try {
            const notes = await api.getEncounterNotes(encounter.id);
            if (notes.count > 0) {
                setHasNotes(true);
                await performProcessing(encounter.id);
            } else {
                setHasNotes(false);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to check clinical notes.');
        } finally {
            setIsCheckingNotes(false);
        }
    };

    const performProcessing = async (encounterId: string) => {
        setIsProcessing(true);
        setProcessStatus('idle');
        setGenerationSuccess(false);
        setError(null);
        try {
            // Step 1: Run Backend BioClinicalBERT Extraction (or reuse existing)
            const facts = await api.extractEncounter(encounterId);
            setExtractedFacts(facts || []);
            setProcessStatus('success');
        } catch (err: any) {
            let msg = err.message || 'Failed to process clinical notes.';
            if (msg.includes('502') || msg.includes('timeout') || msg.includes('Network Error')) {
                msg = 'Clinical note analysis failed. Please retry.';
            }
            setError(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (!selectedEncounter) return;
        setIsGenerating(true);
        setGenerationSuccess(false);
        setError(null);
        try {
            await api.generateSummary(selectedEncounter.id);
            setGenerationSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to generate summary.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fade-in" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            
            {/* Left Panel: Patient & Encounter Selection */}
            <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card">
                    <h2 className="section-title">Select Patient</h2>
                    {loadingPatients ? (
                        <div className="loading-spinner"></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {patients.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => handleSelectPatient(p)}
                                    className={`btn ${selectedPatient?.id === p.id ? 'btn-primary' : 'btn-secondary'}`}
                                    disabled={isCheckingNotes || isProcessing}
                                    style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{p.external_patient_ref || 'Unknown ID'}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Sex: {p.sex || 'N/A'}</div>
                                    </div>
                                </button>
                            ))}
                            {patients.length === 0 && <div className="empty-state">No patients found.</div>}
                        </div>
                    )}
                </div>

                {selectedPatient && (
                    <div className="card fade-in">
                        <h2 className="section-title">Select Encounter</h2>
                        {loadingEncounters ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {encounters.map(e => (
                                    <button 
                                        key={e.id}
                                        onClick={() => handleSelectEncounter(e)}
                                        className={`btn ${selectedEncounter?.id === e.id ? 'btn-primary' : 'btn-secondary'}`}
                                        disabled={isCheckingNotes || isProcessing}
                                        style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
                                    >
                                        <div style={{ fontWeight: 600 }}>{e.service || 'Unknown Service'}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.8 }}>CC: {e.chief_complaint || 'N/A'}</div>
                                    </button>
                                ))}
                                {encounters.length === 0 && <div className="empty-state">No encounters found.</div>}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Panel: Extraction Results */}
            <div style={{ flex: 1 }}>
                <h1 className="page-title">Extracted Summary</h1>
                <p className="page-subtitle">View structured facts automatically extracted from clinical notes using BioClinicalBERT.</p>

                {error && (
                    <div className="alert alert-error fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                        <AlertCircle size={20} />
                        <div style={{ flex: 1 }}>{error}</div>
                        {selectedEncounter && (
                            <button className="btn btn-secondary" onClick={() => performProcessing(selectedEncounter.id)} disabled={isProcessing}>
                                Retry
                            </button>
                        )}
                    </div>
                )}

                {!selectedPatient || !selectedEncounter ? (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--color-text-secondary)' }}>
                        <Search size={48} opacity={0.5} style={{ marginBottom: '16px' }} />
                        <p>Select a patient and encounter from the left to view extracted facts.</p>
                    </div>
                ) : null}

                {selectedEncounter && isCheckingNotes && (
                    <div className="card fade-in" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="loading-spinner"></div>
                        <div>Checking for clinical notes...</div>
                    </div>
                )}

                {selectedEncounter && hasNotes === false && (
                    <div className="card fade-in">
                        <div className="empty-state">
                            <AlertCircle size={32} opacity={0.5} style={{ marginBottom: '12px' }} />
                            <div style={{ fontWeight: 600, marginBottom: '8px' }}>No clinical notes found for this patient encounter.</div>
                            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>BioClinicalBERT cannot extract facts without source clinical notes.</p>
                        </div>
                    </div>
                )}

                {selectedEncounter && hasNotes === true && (
                    <div className="fade-in">
                        {isProcessing ? (
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                                <div className="loading-spinner" style={{ width: '40px', height: '40px', marginBottom: '24px' }}></div>
                                <h3 style={{ margin: 0, marginBottom: '8px' }}>Preparing clinical summary...</h3>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Analyzing clinical notes...</p>
                            </div>
                        ) : processStatus === 'success' ? (
                            <div className="fade-in">
                                <div className="card" style={{ marginBottom: '24px', backgroundColor: 'var(--color-success-light)', borderColor: 'var(--color-success)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ backgroundColor: 'var(--color-success)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-success)', margin: 0 }}>Extraction Complete</h2>
                                    </div>
                                    <div style={{ marginTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={handleGenerateSummary} 
                                            disabled={isGenerating || generationSuccess}
                                        >
                                            {isGenerating ? 'Generating Summary...' : generationSuccess ? 'Summary Generated' : 'Generate Summary'}
                                        </button>
                                        {generationSuccess && (
                                            <div style={{ marginTop: '12px', color: 'var(--color-success)', fontSize: '14px', fontWeight: 600 }}>
                                                Summary generated successfully! Go to "Extracted Notes" in the sidebar to view it.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="fact-grid">
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
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};
