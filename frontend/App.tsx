import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './services/store';
import { Header } from './components/layout/Header';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Approvals } from './pages/Approvals';
import { Reimbursements } from './pages/Reimbursements';
import { Admin } from './pages/Admin';
import { Analytics } from './pages/Analytics';
import { UserRole } from './types';

const AuthPage: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return <Register onBackToLogin={() => setShowRegister(false)} />;
  }

  return <Login onRegister={() => setShowRegister(true)} />;
};

const AppRoutes: React.FC = () => {
  const { currentUser } = useStore();

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />

            <Route path="/approvals" element={
              (currentUser.role === UserRole.MANAGER || currentUser.role === UserRole.FINANCE || currentUser.role === UserRole.ADMIN)
                ? <Approvals />
                : <Navigate to="/dashboard" />
            } />

            <Route path="/reimbursements" element={
              (currentUser.role === UserRole.FINANCE || currentUser.role === UserRole.ADMIN)
                ? <Reimbursements />
                : <Navigate to="/dashboard" />
            } />

            <Route path="/admin" element={
              currentUser.role === UserRole.ADMIN
                ? <Admin />
                : <Navigate to="/dashboard" />
            } />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 mt-auto">
          <div className="w-full py-4 px-8 flex justify-center">
            <p className="text-sm font-medium text-slate-500">
              Developed by Rahul Balachandar
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppRoutes />
    </StoreProvider>
  );
};

export default App;