import { Shell } from '../../components/layout/Shell';
import { StatCard } from '../../components/ui/StatCard';

export function AdminDashboard() {
  return (
    <Shell title="Platform Overview" role="admin">
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Leases" value="128" />
        <StatCard label="Monthly Rent (KES)" value="KES 12,480,000" />
        <StatCard label="Vacancy Rate" value="6.2%" hint="Target: <8%" tone="warning" />
        <StatCard label="Open Maintenance" value="18" tone="danger" />
      </div>
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        <ul className="text-sm text-gray list-disc pl-4 space-y-1">
          <li>Realtime rent payments feed via Supabase Realtime.</li>
          <li>AI insights refresh every 24 hours via Edge Function.</li>
          <li>pg_cron jobs scheduled for rent_due and lease_expiring notices.</li>
        </ul>
      </div>
    </Shell>
  );
}
