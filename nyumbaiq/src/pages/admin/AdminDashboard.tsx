import { useEffect, useState } from 'react';
import { Shell } from '../../components/layout/Shell';
import { StatCard } from '../../components/ui/StatCard';
import { supabase } from '../../lib/supabaseClient';
import { formatKES } from '../../lib/formatters';

export function AdminDashboard() {
  const [stats, setStats] = useState({ leases: 0, rent: 0, vacantUnits: 0, totalUnits: 0, openMaint: 0 });

  useEffect(() => {
    (async () => {
      const [{ count: leases }, { data: payments }, { count: vacant }, { count: totalUnits }, { count: openMaint }] = await Promise.all([
        supabase.from('leases').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('rent_payments').select('amount_paid').eq('status', 'confirmed'),
        supabase.from('units').select('*', { count: 'exact', head: true }).eq('status', 'vacant'),
        supabase.from('units').select('*', { count: 'exact', head: true }),
        supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
      ]);
      const rent = (payments ?? []).reduce((s, p) => s + (p.amount_paid ?? 0), 0);
      setStats({
        leases: leases ?? 0,
        rent,
        vacantUnits: vacant ?? 0,
        totalUnits: totalUnits ?? 0,
        openMaint: openMaint ?? 0,
      });
    })();
  }, []);

  const vacancyRate = stats.totalUnits > 0 ? ((stats.vacantUnits / stats.totalUnits) * 100).toFixed(1) + '%' : '0%';

  return (
    <Shell title="Platform Overview" role="admin">
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Leases" value={String(stats.leases)} />
        <StatCard label="Total Rent Collected" value={formatKES(stats.rent)} />
        <StatCard label="Vacancy Rate" value={vacancyRate} hint={`${stats.vacantUnits} of ${stats.totalUnits} units`} tone={stats.vacantUnits > 0 ? 'warning' : 'success'} />
        <StatCard label="Open Maintenance" value={String(stats.openMaint)} tone={stats.openMaint > 0 ? 'danger' : 'success'} />
      </div>
    </Shell>
  );
}
