import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, Activity, FileText } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Activity color="var(--color-primary)" size={24} />
          Medisum
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <Users size={18} />
            Patients
          </NavLink>
          <NavLink
            to="/dashboard/extracted-summary"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Activity size={18} />
            Extracted Summary
          </NavLink>
          <NavLink
            to="/dashboard/extracted-notes"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FileText size={18} />
            Extracted Notes
          </NavLink>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          {/* Future: breadcrumbs or user profile could go here */}
          <div style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Clinical Discharge Summary Generator</div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
