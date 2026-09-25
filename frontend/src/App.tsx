import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppHeader } from './components/layout/AppHeader';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { User } from './types';
import { authApi } from './api/auth';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('feedpulse_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('feedpulse_token');
    if (token) {
      authApi.getMe()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('feedpulse_user', JSON.stringify(userData));
        })
        .catch(() => {
          localStorage.removeItem('feedpulse_token');
          localStorage.removeItem('feedpulse_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('feedpulse_token', token);
    localStorage.setItem('feedpulse_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('feedpulse_token');
    localStorage.removeItem('feedpulse_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-2"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!user ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <RegisterPage /> : <Navigate to="/" />}
        />

        <Route
          path="*"
          element={
            user ? (
              <div className="min-h-screen bg-slate-50 flex flex-col">
                <AppHeader user={user} onLogout={handleLogout} />
                <div className="flex flex-1">
                  <Sidebar />
                  <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
