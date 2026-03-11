import { Shell } from '../../components/layout/Shell';
import { StatCard } from '../../components/ui/StatCard';

export function TenantDashboard() {
  return (
    <Shell title="My Lease" role="tenant">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Next Rent Due" value="KES 35,000" hint="Due 05 Apr 2026" />
        <StatCard label="Outstanding" value="KES 0" tone="success" />
        <StatCard label="Deposit Held" value="KES 70,000" />
      </div>
      <div className="card p-4 space-y-2">
        <h2 className="text-lg font-semibold">Actions</h2>
        <button className="btn btn-primary w-full">Pay via M-Pesa STK Push</button>
        <button className="btn btn-ghost w-full">Raise maintenance request</button>
      </div>
    </Shell>
  );
}
