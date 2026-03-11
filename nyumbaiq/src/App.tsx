import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';

// Auth pages
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { ForgotPasswordPage } from './pages/auth/ForgotPassword';

// Dashboard pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { LandlordDashboard } from './pages/landlord/LandlordDashboard';
import { AgentDashboard } from './pages/agent/AgentDashboard';
import { TenantDashboard } from './pages/tenant/TenantDashboard';

// Feature pages
import { PropertiesPage } from './pages/properties/PropertiesPage';
import { UnitsPage } from './pages/properties/UnitsPage';
import { LeasesPage } from './pages/tenants/LeasesPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';
import { MaintenancePage } from './pages/maintenance/MaintenancePage';
import { ListingsPage } from './pages/listings/ListingsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { InsightsPage } from './pages/insights/InsightsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const loading = useAuthStore((s) => s.loading);
  const profile = useAuthStore((s) => s.profile);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="card p-6 text-center">Loading…</div>
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRouter() {
  const profile = useAuthStore((s) => s.profile);
  if (!profile) return null;
  if (profile.role === 'admin') return <AdminDashboard />;
  if (profile.role === 'landlord') return <LandlordDashboard />;
  if (profile.role === 'agent') return <AgentDashboard />;
  return <TenantDashboard />;
}

export default function App() {
  // Initialize auth listener at app level so it's always active
  // (even on public routes like /login)
  useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<RequireAuth><RoleRouter /></RequireAuth>} />

        {/* Admin */}
        <Route path="/admin/properties" element={<RequireAuth><PropertiesPage /></RequireAuth>} />
        <Route path="/admin/users" element={<RequireAuth><AdminUsersPage /></RequireAuth>} />
        <Route path="/admin/payments" element={<RequireAuth><PaymentsPage /></RequireAuth>} />
        <Route path="/admin/maintenance" element={<RequireAuth><MaintenancePage /></RequireAuth>} />
        <Route path="/admin/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />

        {/* Landlord */}
        <Route path="/landlord/properties" element={<RequireAuth><PropertiesPage /></RequireAuth>} />
        <Route path="/landlord/units" element={<RequireAuth><UnitsPage /></RequireAuth>} />
        <Route path="/landlord/tenants" element={<RequireAuth><LeasesPage /></RequireAuth>} />
        <Route path="/landlord/payments" element={<RequireAuth><PaymentsPage /></RequireAuth>} />
        <Route path="/landlord/maintenance" element={<RequireAuth><MaintenancePage /></RequireAuth>} />
        <Route path="/landlord/insights" element={<RequireAuth><InsightsPage /></RequireAuth>} />

        {/* Agent */}
        <Route path="/agent/listings" element={<RequireAuth><ListingsPage /></RequireAuth>} />
        <Route path="/agent/clients" element={<RequireAuth><LeasesPage /></RequireAuth>} />

        {/* Tenant */}
        <Route path="/tenant/payments" element={<RequireAuth><PaymentsPage /></RequireAuth>} />
        <Route path="/tenant/maintenance" element={<RequireAuth><MaintenancePage /></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
