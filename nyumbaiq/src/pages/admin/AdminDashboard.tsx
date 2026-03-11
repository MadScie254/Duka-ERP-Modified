import { useEffect, useState } from 'react';
import { Shell } from '../../components/layout/Shell';
import { StatCard } from '../../components/ui/StatCard';
import { ChartCard } from '../../components/ui/ChartCard';
import { supabase } from '../../lib/supabaseClient';
import { formatKES } from '../../lib/formatters';
import { CHART_COLORS, PIE_PALETTE, STATUS_COLORS } from '../../lib/chartColors';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { format } from 'date-fns';

type MonthRow = { month: string; collected: number; expected: number; rate: number };
type SliceRow = { name: string; value: number };

export function AdminDashboard() {
  const [stats, setStats] = useState({ leases: 0, rent: 0, vacantUnits: 0, totalUnits: 0, openMaint: 0 });
  const [revenueTrend, setRevenueTrend] = useState<MonthRow[]>([]);
  const [occupancy, setOccupancy] = useState<SliceRow[]>([]);
  const [payMethods, setPayMethods] = useState<SliceRow[]>([]);
  const [maintCategories, setMaintCategories] = useState<SliceRow[]>([]);
  const [maintPriority, setMaintPriority] = useState<SliceRow[]>([]);

  useEffect(() => {
    (async () => {
      const [
        { count: leases },
        { data: allPayments },
        { count: vacant },
        { count: totalUnits },
        { count: openMaint },
        { data: unitData },
        { data: maintData },
      ] = await Promise.all([
        supabase.from('leases').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('rent_payments').select('amount_paid, amount_expected, payment_for_month, status, payment_method'),
        supabase.from('units').select('*', { count: 'exact', head: true }).eq('status', 'vacant'),
        supabase.from('units').select('*', { count: 'exact', head: true }),
        supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
        supabase.from('units').select('status'),
        supabase.from('maintenance_requests').select('category, priority, status'),
      ]);

      const payments = (allPayments ?? []) as { amount_paid: number | null; amount_expected: number; payment_for_month: string; status: string; payment_method: string }[];

      // ── Stat cards ──
      const confirmedRent = payments
        .filter((p) => p.status === 'confirmed')
        .reduce((s, p) => s + (p.amount_paid ?? 0), 0);
      setStats({
        leases: leases ?? 0,
        rent: confirmedRent,
        vacantUnits: vacant ?? 0,
        totalUnits: totalUnits ?? 0,
        openMaint: openMaint ?? 0,
      });

      // ── Revenue trend (collected vs expected, last 6 months) ──
      const byMonth = new Map<string, { collected: number; expected: number }>();
      for (const p of payments) {
        const m = p.payment_for_month?.slice(0, 7) ?? '';
        if (!m) continue;
        const e = byMonth.get(m) ?? { collected: 0, expected: 0 };
        e.expected += p.amount_expected;
        e.collected += p.amount_paid ?? 0;
        byMonth.set(m, e);
      }
      const trend: MonthRow[] = [...byMonth.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([m, v]) => ({
          month: format(new Date(m + '-15'), 'MMM yy'),
          collected: v.collected,
          expected: v.expected,
          rate: v.expected > 0 ? Math.round((v.collected / v.expected) * 100) : 0,
        }));
      setRevenueTrend(trend);

      // ── Occupancy donut ──
      const statusCounts = new Map<string, number>();
      for (const u of (unitData ?? []) as { status: string }[]) {
        statusCounts.set(u.status, (statusCounts.get(u.status) ?? 0) + 1);
      }
      setOccupancy([...statusCounts.entries()].map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      })));

      // ── Payment methods pie ──
      const methodCounts = new Map<string, number>();
      for (const p of payments.filter((x) => x.status === 'confirmed' || x.status === 'partial')) {
        const m = p.payment_method ?? 'other';
        methodCounts.set(m, (methodCounts.get(m) ?? 0) + 1);
      }
      setPayMethods([...methodCounts.entries()].map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      })));

      // ── Maintenance by category & priority ──
      const catMap = new Map<string, number>();
      const priMap = new Map<string, number>();
      for (const r of (maintData ?? []) as { category: string; priority: string }[]) {
        catMap.set(r.category, (catMap.get(r.category) ?? 0) + 1);
        priMap.set(r.priority, (priMap.get(r.priority) ?? 0) + 1);
      }
      setMaintCategories([...catMap.entries()].map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })));
      setMaintPriority([...priMap.entries()].map(([name, value]) => ({ name, value })));
    })();
  }, []);

  const vacancyRate = stats.totalUnits > 0 ? ((stats.vacantUnits / stats.totalUnits) * 100).toFixed(1) + '%' : '0%';

  const kesTooltip = (v: number) => formatKES(v);

  return (
    <Shell title="Platform Overview" role="admin">
      {/* ── KPI strip ── */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Leases" value={String(stats.leases)} />
        <StatCard label="Total Rent Collected" value={formatKES(stats.rent)} />
        <StatCard label="Vacancy Rate" value={vacancyRate} hint={`${stats.vacantUnits} of ${stats.totalUnits} units`} tone={stats.vacantUnits > 0 ? 'warning' : 'success'} />
        <StatCard label="Open Maintenance" value={String(stats.openMaint)} tone={stats.openMaint > 0 ? 'danger' : 'success'} />
      </div>

      {/* ── Row 1: Revenue trend + Collection rate ── */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Revenue Trend" subtitle="Collected vs Expected (last 6 months)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueTrend} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={kesTooltip} />
              <Bar dataKey="expected" name="Expected" fill={CHART_COLORS.slate} radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" name="Collected" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Collection Rate" subtitle="% of expected rent received per month">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="rate" name="Collection %" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]}>
                {revenueTrend.map((entry, i) => (
                  <Cell key={i} fill={entry.rate >= 90 ? CHART_COLORS.green : entry.rate >= 70 ? CHART_COLORS.amber : CHART_COLORS.red} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 2: Occupancy + Payment Methods ── */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Unit Occupancy" subtitle="Current unit status breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={occupancy} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {occupancy.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name.replace(/ /g, '_')] ?? PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payment Methods" subtitle="How tenants pay rent">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={payMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {payMethods.map((_, i) => (
                  <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 3: Maintenance categories + priorities ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Maintenance by Category" subtitle="All-time request distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={maintCategories} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" name="Requests" fill={CHART_COLORS.blue} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Maintenance by Priority" subtitle="Request priority breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={maintPriority} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3} label={({ name, value }) => `${name} (${value})`}>
                {maintPriority.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] ?? PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </Shell>
  );
}
