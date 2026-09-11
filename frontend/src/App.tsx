import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { PrescriptionsPage } from './pages/PrescriptionsPage';
import { InventoryPage } from './pages/InventoryPage';
import { BillingPage } from './pages/BillingPage';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage';
import { LabTestsPage } from './pages/LabTestsPage';
import { DBMSExplorerPage } from './pages/DBMSExplorerPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Hospital Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/prescriptions" element={<PrescriptionsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/records" element={<MedicalRecordsPage />} />
              <Route path="/lab-tests" element={<LabTestsPage />} />
              <Route path="/dbms-explorer" element={<DBMSExplorerPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
