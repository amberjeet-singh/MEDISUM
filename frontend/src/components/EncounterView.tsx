import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Encounter, Patient } from '../types';
import { PlusCircle } from 'lucide-react';

export const EncounterView: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    
    const [patient, setPatient] = useState<Patient | null>(null);
    const [encounters, setEncounters] = useState<Encounter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showCreate, setShowCreate] = useState(false);
    const [newEncounter, setNewEncounter] = useState({ service: '', attending: '', chief_complaint: '' });
    const [isCreating, setIsCreating] = useState(false);
    const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

    useEffect(() => {
        if (!patientId) return;

        const fetchData = async () => {
            try {
                const [patientData, encountersData] = await Promise.all([
                    api.getPatient(patientId),
                    api.getPatientEncounters(patientId)
                ]);
                setPatient(patientData);
                setEncounters(encountersData.data);
            } catch (err: any) {
                setError(err.message || 'Failed to load patient encounters');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [patientId]);

    const handleCreateEncounter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientId) return;
        setIsCreating(true);
        try {
            const created = await api.createEncounter({ patient_id: patientId, ...newEncounter });
            navigate(`/encounters/${created.id}/workspace`);
        } catch (err: any) {
            setError(err.message || 'Failed to create encounter');
            setIsCreating(false);
        }
    };

    const handleSelectEncounter = async (encounterId: string) => {
        setNavigatingTo(encounterId);
        try {
            const notes = await api.getEncounterNotes(encounterId);
            if (notes.count > 0) {
                // Existing notes, skip to extraction
                navigate(`/encounters/${encounterId}/workspace?step=2`);
            } else {
                // No notes, start at rough notes form
                navigate(`/encounters/${encounterId}/workspace?step=1`);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to check notes');
            setNavigatingTo(null);
        }
    };

    if (loading) return (
        <div className="loading-container fade-in">
            <div className="loading-spinner"></div>
            <div>Loading encounters...</div>
        </div>
    );

    if (error) return <div className="alert alert-error">{error}</div>;
    if (!patient) return <div className="empty-state">Patient not found</div>;

    const displayRef = patient.external_patient_ref || patient.id.split('-')[0];

    return (
        <div className="fade-in">
            <h1 className="page-title">Patient: {displayRef}</h1>
            <p className="page-subtitle">Sex: {patient.sex || 'N/A'} • DOB: {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>Encounter History</h2>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    <PlusCircle size={16} />
                    New Encounter
                </button>
            </div>

            {showCreate && (
                <div className="card fade-in" style={{ marginBottom: '24px' }}>
                    <h2 className="section-title">Create New Encounter</h2>
                    <form onSubmit={handleCreateEncounter}>
                        <div className="form-group">
                            <label className="form-label">Service (e.g. General Medicine)</label>
                            <input type="text" className="form-textarea" style={{ minHeight: '40px' }} value={newEncounter.service} onChange={e => setNewEncounter({...newEncounter, service: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Attending</label>
                            <input type="text" className="form-textarea" style={{ minHeight: '40px' }} value={newEncounter.attending} onChange={e => setNewEncounter({...newEncounter, attending: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Chief Complaint</label>
                            <input type="text" className="form-textarea" style={{ minHeight: '40px' }} value={newEncounter.chief_complaint} onChange={e => setNewEncounter({...newEncounter, chief_complaint: e.target.value})} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="btn btn-primary" disabled={isCreating}>{isCreating ? 'Creating...' : 'Create'}</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {encounters.length === 0 ? (
                <div className="empty-state">
                    No encounters found for this patient. Click "New Encounter" to begin.
                </div>
            ) : (
                <div className="fact-grid">
                    {encounters.map(encounter => (
                        <div key={encounter.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontWeight: 600, fontSize: '18px', color: 'var(--color-primary)', marginBottom: '4px' }}>
                                    {encounter.service || 'General Service'}
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                    {new Date(encounter.created_at).toLocaleDateString()} • {encounter.attending || 'Unknown Attending'}
                                </div>
                            </div>
                            
                            <div style={{ fontSize: '14px', marginBottom: '24px', flex: 1 }}>
                                <strong>Chief Complaint:</strong> {encounter.chief_complaint || 'N/A'}
                            </div>

                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%' }}
                                onClick={() => handleSelectEncounter(encounter.id)}
                                disabled={navigatingTo === encounter.id}
                            >
                                {navigatingTo === encounter.id ? (
                                    <><div className="loading-spinner" style={{width: 16, height: 16, borderWidth: 2}}></div> Checking...</>
                                ) : (
                                    <><PlusCircle size={16} /> Open Consultation</>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
