import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Patient } from '../types';
import { PlusCircle } from 'lucide-react';

export const PatientList: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newPatient, setNewPatient] = useState({ external_patient_ref: '', sex: '', date_of_birth: '' });
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await api.getPatients();
                setPatients(data.data);
            } catch (err: any) {
                setError(err.message || 'Failed to load patients');
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const handleCreatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const created = await api.createPatient(newPatient);
            navigate(`/patients/${created.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to create patient');
            setIsCreating(false);
        }
    };

    if (loading) return (
        <div className="loading-container fade-in">
            <div className="loading-spinner"></div>
            <div>Loading patients...</div>
        </div>
    );

    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Patient Directory</h1>
                    <p className="page-subtitle">Select a patient to view encounters and start a consultation.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    <PlusCircle size={16} />
                    Add New Patient
                </button>
            </div>

            {showCreate && (
                <div className="card fade-in" style={{ marginBottom: '24px' }}>
                    <h2 className="section-title">Create New Patient</h2>
                    <form onSubmit={handleCreatePatient}>
                        <div className="form-group">
                            <label className="form-label">External Patient Reference (Optional)</label>
                            <input type="text" className="form-textarea" style={{ minHeight: '40px' }} value={newPatient.external_patient_ref} onChange={e => setNewPatient({...newPatient, external_patient_ref: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sex (Optional)</label>
                            <select className="form-textarea" style={{ minHeight: '40px' }} value={newPatient.sex} onChange={e => setNewPatient({...newPatient, sex: e.target.value})}>
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date of Birth (Optional)</label>
                            <input type="date" className="form-textarea" style={{ minHeight: '40px' }} value={newPatient.date_of_birth} onChange={e => setNewPatient({...newPatient, date_of_birth: e.target.value})} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="btn btn-primary" disabled={isCreating}>{isCreating ? 'Creating...' : 'Create'}</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {patients.length === 0 ? (
                <div className="empty-state">No patients found.</div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient ID</th>
                                <th>Sex</th>
                                <th>Date of Birth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map(patient => (
                                <tr 
                                    key={patient.id} 
                                    className="clickable-row"
                                    onClick={() => navigate(`/patients/${patient.id}`)}
                                >
                                    <td>
                                        <div style={{fontWeight: 500, color: 'var(--color-primary)'}}>
                                            {patient.external_patient_ref || patient.id.split('-')[0]}
                                        </div>
                                    </td>
                                    <td>{patient.sex || 'Unknown'}</td>
                                    <td>{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'Unknown'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
