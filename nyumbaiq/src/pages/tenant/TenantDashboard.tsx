import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../../components/layout/Shell';
import { StatCard } from '../../components/ui/StatCard';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { formatKES, formatDate } from '../../lib/formatters';

export function TenantDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const [stats, setStats] = useState({ nextRent: 0, dueDate: '', outstanding: 0, deposit: 0 });

  useEffect(() => {
    if (!profile) return;
    (async () => {
      // Get active lease
      const { data: lease } = await supabase
        .from('leases')
        .select('monthly_rent, deposit_paid, payment_day')
        .eq('tenant_id', profile.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      // Get outstanding payments
      const { data: pending } = await supabase
        .from('rent_payments')
        .select('amount_expected, amount_paid')
        .eq('tenant_id', profile.id)
        .in('status', ['pending', 'partial']);

      const outstanding = (pending ?? []).reduce((s, p) => s + (p.amount_expected - (p.amount_paid ?? 0)), 0);

      const now = new Date();
      const day = lease?.payment_day ?? 5;
      let dueMonth = now.getMonth();
      let dueYear = now.getFullYear();
      if (now.getDate() > day) { dueMonth++; if (dueMonth > 11) { dueMonth = 0; dueYear++; } }
      const dueDate = new Date(dueYear, dueMonth, day);

      setStats({
        nextRent: lease?.monthly_rent ?? 0,
        dueDate: formatDate(dueDate),
        outstanding,
        deposit: lease?.deposit_paid ?? 0,
      });
    })();
  }, [profile?.id]);

  return (
    <Shell title="My Lease" role="tenant">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Next Rent Due" value={formatKES(stats.nextRent)} hint={stats.dueDate ? `Due ${stats.dueDate}` : ''} />
        <StatCard label="Outstanding" value={formatKES(stats.outstanding)} tone={stats.outstanding > 0 ? 'danger' : 'success'} />
        <StatCard label="Deposit Held" value={formatKES(stats.deposit)} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/tenant/payments" className="card p-4 hover:shadow-md transition-shadow text-center">
          <h3 className="font-semibold">Pay via M-Pesa</h3>
          <p className="text-sm text-gray">View payment history or pay rent</p>
        </Link>
        <Link to="/tenant/maintenance" className="card p-4 hover:shadow-md transition-shadow text-center">
          <h3 className="font-semibold">Maintenance Request</h3>
          <p className="text-sm text-gray">Report an issue in your unit</p>
        </Link>
      </div>
    </Shell>
  );
}
