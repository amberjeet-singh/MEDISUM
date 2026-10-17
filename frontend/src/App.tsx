import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PatientList } from './components/PatientList';
import { EncounterView } from './components/EncounterView';
import { ConsultationWorkspace } from './components/ConsultationWorkspace';
import { ExtractedSummary } from './components/ExtractedSummary';
import { ExtractedNotes } from './components/ExtractedNotes';
import LandingPage from './components/LandingPage';
import './index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page at root */}
        <Route path="/" element={<LandingPage />} />

        {/* Full Medisum dashboard under /dashboard */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<PatientList />} />
          <Route path="extracted-summary" element={<ExtractedSummary />} />
          <Route path="extracted-notes" element={<ExtractedNotes />} />
          <Route path="patients/:patientId" element={<EncounterView />} />
          <Route path="encounters/:encounterId/workspace" element={<ConsultationWorkspace />} />
        </Route>

        {/* Catch-all → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
