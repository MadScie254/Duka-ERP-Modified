import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, CreditCard, Wrench, Bell, LogOut, Sparkles, Megaphone, Home } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

type ShellProps = {
  title: string;
  children: React.ReactNode;
  role: 'admin' | 'landlord' | 'agent' | 'tenant';
};

const navByRole: Record<ShellProps['role'], { label: string; icon: React.FC<any>; to: string }[]> = {
  admin: [
    { label: 'Overview', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Properties', icon: Building2, to: '/admin/properties' },
    { label: 'Users', icon: Users, to: '/admin/users' },
    { label: 'Payments', icon: CreditCard, to: '/admin/payments' },
    { label: 'Maintenance', icon: Wrench, to: '/admin/maintenance' },
    { label: 'Notifications', icon: Bell, to: '/admin/notifications' },
  ],
  landlord: [
    { label: 'Portfolio', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Properties', icon: Building2, to: '/landlord/properties' },
    { label: 'Tenants', icon: Users, to: '/landlord/tenants' },
    { label: 'Payments', icon: CreditCard, to: '/landlord/payments' },
    { label: 'Maintenance', icon: Wrench, to: '/landlord/maintenance' },
    { label: 'AI Insights', icon: Sparkles, to: '/landlord/insights' },
  ],
  agent: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Listings', icon: Megaphone, to: '/agent/listings' },
    { label: 'Clients', icon: Users, to: '/agent/clients' },
  ],
  tenant: [
    { label: 'My Home', icon: Home, to: '/dashboard' },
    { label: 'Payments', icon: CreditCard, to: '/tenant/payments' },
    { label: 'Maintenance', icon: Wrench, to: '/tenant/maintenance' },
  ],
};

export function Shell({ title, children, role }: ShellProps) {
  const location = useLocation();
  const navItems = navByRole[role];

  return (
    <div className="min-h-screen flex bg-bg text-navy">
      <aside className="hidden md:flex w-64 bg-navy text-white flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="text-lg font-bold">NyumbaIQ</div>
          <div className="text-xs opacity-80">Danco Analytics</div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-button ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <Icon size={18} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          className="flex items-center gap-2 px-4 py-4 text-sm border-t border-white/10 hover:bg-white/5"
          onClick={() => supabase.auth.signOut()}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </aside>

      <main className="flex-1">
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-border">
          <div>
            <p className="text-xs text-gray">NyumbaIQ · {role.toUpperCase()}</p>
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-gray" />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
