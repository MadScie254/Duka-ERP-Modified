import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../../components/layout/Shell';
import { StatCard } from '../../components/ui/StatCard';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';

export function AgentDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const [stats, setStats] = useState({ active: 0, featured: 0, views: 0 });

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase
        .from('listings')
        .select('is_active, is_featured, views_count')
        .eq('listed_by', profile.id);
      const rows = data ?? [];
      setStats({
        active: rows.filter((r) => r.is_active).length,
        featured: rows.filter((r) => r.is_featured).length,
        views: rows.reduce((s, r) => s + (r.views_count ?? 0), 0),
      });
    })();
  }, [profile?.id]);

  return (
    <Shell title="Listings Performance" role="agent">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Active Listings" value={String(stats.active)} />
        <StatCard label="Featured" value={String(stats.featured)} />
        <StatCard label="Total Views" value={stats.views.toLocaleString()} />
      </div>
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
