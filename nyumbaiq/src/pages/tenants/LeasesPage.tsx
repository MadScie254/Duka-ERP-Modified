import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuthStore } from '../../../store/authStore';
import type { Lease } from '../../../lib/types';
import { Shell } from '../../../components/layout/Shell';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatKES, formatDate } from '../../../lib/formatters';
import { FileText } from 'lucide-react';

const leaseTone = (s: string) => {
  if (s === 'active') return 'success' as const;
  if (s === 'pending_signature') return 'warning' as const;
  if (s === 'expired') return 'default' as const;
  return 'danger' as const;
};

export function LeasesPage() {
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role ?? 'tenant';
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('leases')
        .select('*, properties(name), units(unit_number), tenant:profiles!leases_tenant_id_fkey(full_name, email)')
        .order('created_at', { ascending: false });
      setLeases((data ?? []) as Lease[]);
      setLoading(false);
    })();
  }, []);

  return (
    <Shell title="Leases" role={role}>
      {loading ? (
        <div className="card p-6 text-center text-gray">Loading...</div>
      ) : leases.length === 0 ? (
        <EmptyState icon={<FileText size={40} />} title="No leases" description="Leases will appear here once tenants are assigned to units." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-gray">
                <th className="py-2 pr-4">Tenant</th>
                <th className="py-2 pr-4">Property</th>
                <th className="py-2 pr-4">Unit</th>
                <th className="py-2 pr-4">Rent</th>
                <th className="py-2 pr-4">Period</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {leases.map((l) => {
                const tenant = l.tenant as unknown as { full_name: string; email: string } | null;
                const prop = l.property as unknown as { name: string } | null;
                const unit = l.unit as unknown as { unit_number: string } | null;
                return (
                  <tr key={l.id} className="border-b border-border/50 hover:bg-bg/50">
                    <td className="py-2.5 pr-4 font-medium">{tenant?.full_name ?? tenant?.email ?? '—'}</td>
                    <td className="py-2.5 pr-4">{prop?.name ?? '—'}</td>
                    <td className="py-2.5 pr-4">{unit?.unit_number ?? '—'}</td>
                    <td className="py-2.5 pr-4 font-medium">{formatKES(l.monthly_rent)}</td>
                    <td className="py-2.5 pr-4 text-xs">{formatDate(l.start_date)} — {l.end_date ? formatDate(l.end_date) : 'Ongoing'}</td>
                    <td className="py-2.5 pr-4"><Badge tone={leaseTone(l.status)}>{l.status.replace('_', ' ')}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}
