/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/Login/LoginPage';
import { UserProfilePage } from './pages/UserProfile/UserProfilePage';
import { AdminLoginPage } from './pages/Admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/Admin/Dashboard/AdminDashboardPage';

const PrivateUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const PrivateAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-shell min-h-screen text-slate-100 selection:bg-amber-500 selection:text-slate-950">
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route
              path="/user-profile"
              element={
                <PrivateUserRoute>
                  <UserProfilePage />
                </PrivateUserRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <PrivateAdminRoute>
                  <AdminDashboardPage />
                </PrivateAdminRoute>
              }
            />

            <Route path="*" element={<Navigate to="/user-profile" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
