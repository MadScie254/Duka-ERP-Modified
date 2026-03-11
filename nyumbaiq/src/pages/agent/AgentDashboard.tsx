import { Shell } from '../../components/layout/Shell';
import { StatCard } from '../../components/ui/StatCard';

export function AgentDashboard() {
  return (
    <Shell title="Listings Performance" role="agent">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Active Listings" value="22" />
        <StatCard label="Featured" value="6" />
        <StatCard label="Views (7d)" value="4,120" />
      </div>
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-3">Quick tips</h2>
        <ul className="list-disc text-sm text-gray pl-4 space-y-1">
          <li>Ensure each listing has county + map coordinates for SEO.</li>
          <li>Attach virtual_tour_url for premium units.</li>
          <li>Keep is_active and expires_at updated to avoid stale stock.</li>
        </ul>
      </div>
    </Shell>
  );
}
