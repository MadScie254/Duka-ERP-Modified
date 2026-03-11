import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../../components/layout/Shell';
import { StatCard } from '../../components/ui/StatCard';
import { ChartCard } from '../../components/ui/ChartCard';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import { CHART_COLORS, PIE_PALETTE } from '../../lib/chartColors';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

type ViewRow = { title: string; views: number; featured: boolean };
type TypeRow = { name: string; value: number };

export function AgentDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const [stats, setStats] = useState({ active: 0, featured: 0, views: 0 });
  const [viewData, setViewData] = useState<ViewRow[]>([]);
  const [typeData, setTypeData] = useState<TypeRow[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase
        .from('listings')
        .select('title, is_active, is_featured, views_count, listing_type')
        .eq('listed_by', profile.id);
      const rows = (data ?? []) as { title: string; is_active: boolean; is_featured: boolean; views_count: number; listing_type: string }[];

      setStats({
        active: rows.filter((r) => r.is_active).length,
        featured: rows.filter((r) => r.is_featured).length,
        views: rows.reduce((s, r) => s + (r.views_count ?? 0), 0),
      });

      // Listing views
      setViewData(
        rows
          .filter((r) => r.is_active)
          .map((r) => ({ title: r.title.length > 20 ? r.title.slice(0, 18) + '…' : r.title, views: r.views_count ?? 0, featured: r.is_featured }))
          .sort((a, b) => b.views - a.views)
      );

      // Listing types
      const typeMap = new Map<string, number>();
      for (const r of rows) {
        typeMap.set(r.listing_type, (typeMap.get(r.listing_type) ?? 0) + 1);
      }
      setTypeData([...typeMap.entries()].map(([name, value]) => ({ name, value })));
    })();
  }, [profile]);

  return (
    <Shell title="Listings Performance" role="agent">
      {/* ── KPI strip ── */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Active Listings" value={String(stats.active)} />
        <StatCard label="Featured" value={String(stats.featured)} />
        <StatCard label="Total Views" value={stats.views.toLocaleString()} />
      </div>

      {/* ── Charts ── */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Views per Listing" subtitle="Active listings ranked by views">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={viewData} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="title" type="category" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]}>
                {viewData.map((entry, i) => (
                  <Cell key={i} fill={entry.featured ? CHART_COLORS.amber : CHART_COLORS.blue} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Listing Types" subtitle="Rent vs Sale vs Lease split">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {typeData.map((_, i) => (
                  <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/agent/listings" className="card p-4 hover:shadow-md transition-shadow">
          <h3 className="font-semibold">Manage Listings</h3>
          <p className="text-sm text-gray">Create and manage property listings</p>
        </Link>
        <Link to="/agent/clients" className="card p-4 hover:shadow-md transition-shadow">
          <h3 className="font-semibold">View Clients</h3>
          <p className="text-sm text-gray">See active leases and tenant info</p>
        </Link>
      </div>
    </Shell>
  );
}
