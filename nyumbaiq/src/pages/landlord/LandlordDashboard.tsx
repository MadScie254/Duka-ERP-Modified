import { Shell } from '../../components/layout/Shell';
import { StatCard } from '../../components/ui/StatCard';

export function LandlordDashboard() {
  return (
    <Shell title="Portfolio Health" role="landlord">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Collected This Month" value="KES 1,480,000" />
        <StatCard label="Outstanding" value="KES 210,000" tone="warning" />
        <StatCard label="Vacant Units" value="4" tone="danger" />
      </div>
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-3">Next Actions</h2>
        <ol className="list-decimal text-sm text-gray pl-4 space-y-2">
          <li>Trigger AI insights refresh for updated arrears forecast.</li>
          <li>Send rent_due notifications for leases due within 5 days.</li>
          <li>Review maintenance requests marked as emergency.</li>
        </ol>
      </div>
    </Shell>
  );
}
