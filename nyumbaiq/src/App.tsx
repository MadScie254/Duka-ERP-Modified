import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { LandlordDashboard } from './pages/landlord/LandlordDashboard';
import { AgentDashboard } from './pages/agent/AgentDashboard';
import { TenantDashboard } from './pages/tenant/TenantDashboard';
import { LoginPage } from './pages/auth/Login';

function RoleRouter() {
  const { loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="card p-6 text-center">Loading…</div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role === 'admin') return <AdminDashboard />;
  if (profile.role === 'landlord') return <LandlordDashboard />;
  if (profile.role === 'agent') return <AgentDashboard />;
  return <TenantDashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<RoleRouter />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
