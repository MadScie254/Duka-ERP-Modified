import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../../components/layout/Shell';
import { StatCard } from '../../components/ui/StatCard';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { formatKES } from '../../lib/formatters';

export function LandlordDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const [stats, setStats] = useState({ collected: 0, outstanding: 0, vacant: 0, emergencyMaint: 0 });

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      const [{ data: paid }, { data: pending }, { count: vacant }, { count: emergency }] = await Promise.all([
        supabase.from('rent_payments').select('amount_paid, properties!inner(owner_id)').eq('status', 'confirmed').eq('properties.owner_id', profile.id).gte('payment_for_month', monthStart),
        supabase.from('rent_payments').select('amount_expected, amount_paid, properties!inner(owner_id)').in('status', ['pending', 'partial']).eq('properties.owner_id', profile.id).gte('payment_for_month', monthStart),
        supabase.from('units').select('*, properties!inner(owner_id)', { count: 'exact', head: true }).eq('status', 'vacant').eq('properties.owner_id', profile.id),
        supabase.from('maintenance_requests').select('*, properties!inner(owner_id)', { count: 'exact', head: true }).eq('properties.owner_id', profile.id).in('status', ['open', 'in_progress']),
      ]);

      const collected = (paid ?? []).reduce((s, p) => s + (p.amount_paid ?? 0), 0);
      const outstanding = (pending ?? []).reduce((s, p) => s + (p.amount_expected - (p.amount_paid ?? 0)), 0);

      setStats({ collected, outstanding, vacant: vacant ?? 0, emergencyMaint: emergency ?? 0 });
    })();
  }, [profile]);

  return (
    <Shell title="Portfolio Health" role="landlord">
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Collected This Month" value={formatKES(stats.collected)} tone="success" />
        <StatCard label="Outstanding" value={formatKES(stats.outstanding)} tone={stats.outstanding > 0 ? 'warning' : 'success'} />
        <StatCard label="Vacant Units" value={String(stats.vacant)} tone={stats.vacant > 0 ? 'danger' : 'success'} />
        <StatCard label="Open Maintenance" value={String(stats.emergencyMaint)} tone={stats.emergencyMaint > 0 ? 'warning' : 'success'} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/landlord/properties" className="card p-4 hover:shadow-md transition-shadow">
          <h3 className="font-semibold">Manage Properties</h3>
          <p className="text-sm text-gray">View and add properties and units</p>
        </Link>
        <Link to="/landlord/insights" className="card p-4 hover:shadow-md transition-shadow">
          <h3 className="font-semibold">AI Insights</h3>
          <p className="text-sm text-gray">Get AI-powered portfolio analysis</p>
        </Link>
      </div>
    </Shell>
  );
}
