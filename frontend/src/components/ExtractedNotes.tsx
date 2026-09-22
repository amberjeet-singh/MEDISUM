import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { Patient, Encounter, GeneratedSummary } from '../types';
import { Search, AlertCircle, FileText } from 'lucide-react';

export const ExtractedNotes: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const [encounters, setEncounters] = useState<Encounter[]>([]);
    const [loadingEncounters, setLoadingEncounters] = useState(false);
    const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);

    const [loadingSummary, setLoadingSummary] = useState(false);
    const [summary, setSummary] = useState<GeneratedSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

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
        setSummary(null);
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

    // 3. Select Encounter and Fetch Summary
    const handleSelectEncounter = async (encounter: Encounter) => {
        setSelectedEncounter(encounter);
        setSummary(null);
        setError(null);
        setLoadingSummary(true);

        try {
            const sumData = await api.getGeneratedSummary(encounter.id);
            setSummary(sumData || null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch generated summary.');
        } finally {
            setLoadingSummary(false);
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

            {/* Right Panel: Extracted Notes / Summary Display */}
            <div style={{ flex: 1 }}>
                <h1 className="page-title">Extracted Notes</h1>
                <p className="page-subtitle">View the AI-generated discharge summary.</p>

                {error && (
                    <div className="alert alert-error fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                        <AlertCircle size={20} />
                        <div style={{ flex: 1 }}>{error}</div>
                        {selectedEncounter && (
                            <button className="btn btn-secondary" onClick={() => handleSelectEncounter(selectedEncounter)}>
                                Retry
                            </button>
                        )}
                    </div>
                )}

                {!selectedPatient || !selectedEncounter ? (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--color-text-secondary)' }}>
                        <Search size={48} opacity={0.5} style={{ marginBottom: '16px' }} />
                        <p>Select a patient and encounter to view the generated summary.</p>
                    </div>
                ) : null}

                {selectedEncounter && loadingSummary && (
                    <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                        <div className="loading-spinner" style={{ width: '40px', height: '40px', marginBottom: '24px' }}></div>
                        <h3 style={{ margin: 0, marginBottom: '8px' }}>Loading summary...</h3>
                    </div>
                )}

                {selectedEncounter && !loadingSummary && !summary && !error && (
                    <div className="card fade-in">
                        <div className="empty-state">
                            <FileText size={32} opacity={0.5} style={{ marginBottom: '12px' }} />
                            <div style={{ fontWeight: 600, marginBottom: '8px' }}>No generated summary found.</div>
                            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Please generate a summary from the Extracted Summary page first.</p>
                        </div>
                    </div>
                )}

                {selectedEncounter && !loadingSummary && summary && (
                    <div className="fade-in">
                        <div className="card" style={{ marginBottom: '24px', backgroundColor: 'var(--color-surface)', borderColor: 'rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px', marginBottom: '16px' }}>
                                <h2 className="section-title" style={{ border: 'none', padding: 0, margin: 0 }}>Discharge Summary</h2>
                                <span className="badge badge-neutral">Model: {summary.model_name || summary.model_provider}</span>
                            </div>
                            
                            {/* Summary Content block preserving line breaks */}
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--color-text)' }}>
                                {(() => {
                                    if (summary.status === 'FAILED') {
                                        return <div className="alert alert-error">Summary generation failed. Please retry.</div>;
                                    }
                                    return <div>{summary.content}</div>;
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
