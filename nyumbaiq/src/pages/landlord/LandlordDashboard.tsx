import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../../components/layout/Shell';
import { StatCard } from '../../components/ui/StatCard';
import { ChartCard } from '../../components/ui/ChartCard';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { formatKES } from '../../lib/formatters';
import { CHART_COLORS, PIE_PALETTE, STATUS_COLORS } from '../../lib/chartColors';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

type PropRent = { name: string; rent: number };
type PropOcc = { name: string; occupied: number; vacant: number; reserved: number; under_maintenance: number };

export function LandlordDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const [stats, setStats] = useState({ collected: 0, outstanding: 0, vacant: 0, emergencyMaint: 0 });
  const [propRent, setPropRent] = useState<PropRent[]>([]);
  const [propOcc, setPropOcc] = useState<PropOcc[]>([]);
  const [payMethods, setPayMethods] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      const [{ data: paid }, { data: pending }, { count: vacant }, { count: emergency }, { data: propData }, { data: unitData }] = await Promise.all([
        supabase.from('rent_payments').select('amount_paid, properties!inner(owner_id)').eq('status', 'confirmed').eq('properties.owner_id', profile.id).gte('payment_for_month', monthStart),
        supabase.from('rent_payments').select('amount_expected, amount_paid, payment_method, properties!inner(owner_id)').in('status', ['pending', 'partial']).eq('properties.owner_id', profile.id).gte('payment_for_month', monthStart),
        supabase.from('units').select('*, properties!inner(owner_id)', { count: 'exact', head: true }).eq('status', 'vacant').eq('properties.owner_id', profile.id),
        supabase.from('maintenance_requests').select('*, properties!inner(owner_id)', { count: 'exact', head: true }).eq('properties.owner_id', profile.id).in('status', ['open', 'in_progress']),
        supabase.from('properties').select('id, name').eq('owner_id', profile.id),
        supabase.from('units').select('property_id, status, monthly_rent'),
      ]);

      // ── Stat cards ──
      const collected = (paid ?? []).reduce((s, p) => s + (p.amount_paid ?? 0), 0);
      const outstanding = (pending ?? []).reduce((s, p) => s + (p.amount_expected - (p.amount_paid ?? 0)), 0);
      setStats({ collected, outstanding, vacant: vacant ?? 0, emergencyMaint: emergency ?? 0 });

      // ── Payment methods ──
      const methodMap = new Map<string, number>();
      for (const p of [...(paid ?? []), ...(pending ?? [])] as { payment_method?: string }[]) {
        const m = (p.payment_method ?? 'other').replace(/_/g, ' ');
        methodMap.set(m, (methodMap.get(m) ?? 0) + 1);
      }
      setPayMethods([...methodMap.entries()].map(([name, value]) => ({ name, value })));

      // ── Rent distribution & occupancy by property ──
      const props = (propData ?? []) as { id: string; name: string }[];
      const allUnits = (unitData ?? []) as { property_id: string; status: string; monthly_rent: number }[];
      const propIds = new Set(props.map((p) => p.id));
      const myUnits = allUnits.filter((u) => propIds.has(u.property_id));

      const rentMap: PropRent[] = [];
      const occMap: PropOcc[] = [];
      for (const prop of props) {
        const pu = myUnits.filter((u) => u.property_id === prop.id);
        rentMap.push({ name: prop.name.split(' ')[0], rent: pu.reduce((s, u) => s + u.monthly_rent, 0) });
        const counts = { occupied: 0, vacant: 0, reserved: 0, under_maintenance: 0 };
        for (const u of pu) {
          const k = u.status as keyof typeof counts;
          if (k in counts) counts[k]++;
        }
        occMap.push({ name: prop.name.split(' ')[0], ...counts });
      }
      setPropRent(rentMap);
      setPropOcc(occMap);
    })();
  }, [profile]);

  return (
    <Shell title="Portfolio Health" role="landlord">
      {/* ── KPI strip ── */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Collected This Month" value={formatKES(stats.collected)} tone="success" />
        <StatCard label="Outstanding" value={formatKES(stats.outstanding)} tone={stats.outstanding > 0 ? 'warning' : 'success'} />
        <StatCard label="Vacant Units" value={String(stats.vacant)} tone={stats.vacant > 0 ? 'danger' : 'success'} />
        <StatCard label="Open Maintenance" value={String(stats.emergencyMaint)} tone={stats.emergencyMaint > 0 ? 'warning' : 'success'} />
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Monthly Rent by Property" subtitle="Total rent potential per property">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={propRent} layout="vertical" barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatKES(v)} />
              <Bar dataKey="rent" name="Total Rent" fill={CHART_COLORS.blue} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Occupancy by Property" subtitle="Unit status per property">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={propOcc} barGap={1}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="occupied" name="Occupied" stackId="a" fill={STATUS_COLORS.occupied} />
              <Bar dataKey="vacant" name="Vacant" stackId="a" fill={STATUS_COLORS.vacant} />
              <Bar dataKey="reserved" name="Reserved" stackId="a" fill={STATUS_COLORS.reserved} />
              <Bar dataKey="under_maintenance" name="Maintenance" stackId="a" fill={STATUS_COLORS.under_maintenance} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Payment Methods" subtitle="How tenants pay you">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={payMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {payMethods.map((_, i) => (
                  <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid gap-4">
          <Link to="/landlord/properties" className="card p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold">Manage Properties</h3>
            <p className="text-sm text-gray">View and add properties and units</p>
          </Link>
          <Link to="/landlord/insights" className="card p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold">AI Insights</h3>
            <p className="text-sm text-gray">Get AI-powered portfolio analysis</p>
          </Link>
        </div>
      </div>
    </Shell>
  );
}
