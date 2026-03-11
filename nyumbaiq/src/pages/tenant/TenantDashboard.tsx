import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../../components/layout/Shell';
import { StatCard } from '../../components/ui/StatCard';
import { ChartCard } from '../../components/ui/ChartCard';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { formatKES, formatDate } from '../../lib/formatters';
import { CHART_COLORS, STATUS_COLORS } from '../../lib/chartColors';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import { format, differenceInDays, parseISO } from 'date-fns';

type PayRow = { month: string; paid: number; expected: number; status: string };

export function TenantDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const [stats, setStats] = useState({ nextRent: 0, dueDate: '', outstanding: 0, deposit: 0 });
  const [payHistory, setPayHistory] = useState<PayRow[]>([]);
  const [leaseDays, setLeaseDays] = useState<{ total: number; elapsed: number; remaining: number } | null>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: lease } = await supabase
        .from('leases')
        .select('monthly_rent, deposit_paid, payment_day, start_date, end_date')
        .eq('tenant_id', profile.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      const { data: allPayments } = await supabase
        .from('rent_payments')
        .select('amount_expected, amount_paid, payment_for_month, status')
        .eq('tenant_id', profile.id)
        .order('payment_for_month', { ascending: true });

      const pending = (allPayments ?? []).filter((p) => p.status === 'pending' || p.status === 'partial');
      const outstanding = pending.reduce((s, p) => s + (p.amount_expected - (p.amount_paid ?? 0)), 0);

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

      // Payment history
      const rows: PayRow[] = (allPayments ?? [])
        .slice(-6)
        .map((p) => ({
          month: p.payment_for_month ? format(new Date(p.payment_for_month + 'T00:00:00'), 'MMM yy') : '?',
          paid: p.amount_paid ?? 0,
          expected: p.amount_expected,
          status: p.status,
        }));
      setPayHistory(rows);

      // Lease countdown
      if (lease?.start_date && lease?.end_date) {
        const start = parseISO(lease.start_date);
        const end = parseISO(lease.end_date);
        const total = differenceInDays(end, start);
        const elapsed = differenceInDays(now, start);
        setLeaseDays({ total, elapsed: Math.min(elapsed, total), remaining: Math.max(total - elapsed, 0) });
      } else if (lease?.start_date) {
        const start = parseISO(lease.start_date);
        const elapsed = differenceInDays(now, start);
        setLeaseDays({ total: 0, elapsed, remaining: 0 });
      }
    })();
  }, [profile]);

  const leasePercent = leaseDays && leaseDays.total > 0 ? Math.min(100, Math.round((leaseDays.elapsed / leaseDays.total) * 100)) : null;

  return (
    <Shell title="My Lease" role="tenant">
      {/* ── KPI strip ── */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Next Rent Due" value={formatKES(stats.nextRent)} hint={stats.dueDate ? `Due ${stats.dueDate}` : ''} />
        <StatCard label="Outstanding" value={formatKES(stats.outstanding)} tone={stats.outstanding > 0 ? 'danger' : 'success'} />
        <StatCard label="Deposit Held" value={formatKES(stats.deposit)} />
      </div>

      {/* ── Charts ── */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Payment History" subtitle="Your monthly payments (last 6 months)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={payHistory} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatKES(v)} />
              <Bar dataKey="expected" name="Expected" fill={CHART_COLORS.slate} radius={[4, 4, 0, 0]} opacity={0.3} />
              <Bar dataKey="paid" name="Paid" radius={[4, 4, 0, 0]}>
                {payHistory.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] ?? CHART_COLORS.blue} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="space-y-4">
          {/* Lease countdown */}
          <ChartCard title="Lease Status" subtitle={leaseDays?.total ? `${leaseDays.remaining} days remaining` : 'Auto-renewing lease'}>
            {leasePercent !== null ? (
              <div>
                <div className="w-full bg-gray/20 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${leasePercent}%`,
                      backgroundColor: leasePercent > 85 ? CHART_COLORS.red : leasePercent > 60 ? CHART_COLORS.amber : CHART_COLORS.green,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray mt-2">
                  <span>{leaseDays?.elapsed} days elapsed</span>
                  <span>{leasePercent}% complete</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green/10 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green animate-pulse" />
                <span className="text-sm font-medium">Active — auto-renewing lease ({leaseDays?.elapsed ?? 0} days active)</span>
              </div>
            )}
          </ChartCard>

          {/* Quick actions */}
          <Link to="/tenant/payments" className="card p-4 hover:shadow-md transition-shadow text-center block">
            <h3 className="font-semibold">Pay via M-Pesa</h3>
            <p className="text-sm text-gray">View payment history or pay rent</p>
          </Link>
          <Link to="/tenant/maintenance" className="card p-4 hover:shadow-md transition-shadow text-center block">
            <h3 className="font-semibold">Maintenance Request</h3>
            <p className="text-sm text-gray">Report an issue in your unit</p>
          </Link>
        </div>
      </div>
    </Shell>
  );
}
