import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import type { RentPayment } from '../../lib/types';
import { Shell } from '../../components/layout/Shell';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { formatKES, formatDate } from '../../lib/formatters';
import { initiateStkPush } from '../../lib/mpesa';
import { CreditCard, Phone, Loader2 } from 'lucide-react';

const statusTone = (s: string) => {
  if (s === 'confirmed') return 'success' as const;
  if (s === 'pending') return 'warning' as const;
  if (s === 'partial') return 'info' as const;
  return 'danger' as const;
};

export function PaymentsPage() {
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role ?? 'tenant';
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPay, setShowPay] = useState(false);
  const [selected, setSelected] = useState<RentPayment | null>(null);
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    const q = supabase
      .from('rent_payments')
      .select('*, properties(name), units(unit_number), tenant:profiles!rent_payments_tenant_id_fkey(full_name)')
      .order('payment_for_month', { ascending: false });

    if (role === 'tenant' && profile) {
      q.eq('tenant_id', profile.id);
    }

    const { data } = await q;
    setPayments((data ?? []) as RentPayment[]);
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleStkPush = async () => {
    if (!selected || !phone) return;
    setPushing(true);
    setPushResult(null);
    try {
      await initiateStkPush({
        amount: selected.amount_expected - (selected.amount_paid ?? 0),
        phone,
        lease_id: selected.lease_id,
        tenant_id: selected.tenant_id,
        property_id: selected.property_id,
        unit_id: selected.unit_id,
        payment_for_month: selected.payment_for_month,
      });
      setPushResult('STK Push sent. Check your phone to complete the payment.');
    } catch (err: unknown) {
      setPushResult(`Error: ${err instanceof Error ? err.message : 'STK Push failed'}`);
    } finally {
      setPushing(false);
    }
  };

  return (
    <Shell title="Payments" role={role}>
      {loading ? (
        <div className="card p-6 text-center text-gray">Loading...</div>
      ) : payments.length === 0 ? (
        <EmptyState icon={<CreditCard size={40} />} title="No payments" description="Payment records will appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-gray">
                {role !== 'tenant' && <th className="py-2 pr-4">Tenant</th>}
                <th className="py-2 pr-4">Property</th>
                <th className="py-2 pr-4">Unit</th>
                <th className="py-2 pr-4">Month</th>
                <th className="py-2 pr-4">Expected</th>
                <th className="py-2 pr-4">Paid</th>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2 pr-4">Status</th>
                {role === 'tenant' && <th className="py-2 pr-4"></th>}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const tenant = p.tenant as unknown as { full_name: string } | null;
                const prop = p.property as unknown as { name: string } | null;
                const unit = p.unit as unknown as { unit_number: string } | null;
                const balance = p.amount_expected - (p.amount_paid ?? 0);
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-bg/50">
                    {role !== 'tenant' && <td className="py-2.5 pr-4 font-medium">{tenant?.full_name ?? '—'}</td>}
                    <td className="py-2.5 pr-4">{prop?.name ?? '—'}</td>
                    <td className="py-2.5 pr-4">{unit?.unit_number ?? '—'}</td>
                    <td className="py-2.5 pr-4">{formatDate(p.payment_for_month)}</td>
                    <td className="py-2.5 pr-4 font-medium">{formatKES(p.amount_expected)}</td>
                    <td className="py-2.5 pr-4">{formatKES(p.amount_paid)}</td>
                    <td className="py-2.5 pr-4 capitalize">{p.payment_method.replace('_', ' ')}</td>
                    <td className="py-2.5 pr-4"><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                    {role === 'tenant' && (
                      <td className="py-2.5 pr-4">
                        {balance > 0 && p.status !== 'confirmed' && (
                          <button
                            className="btn text-xs px-3 py-1"
                            onClick={() => { setSelected(p); setShowPay(true); }}
                          >
                            Pay {formatKES(balance)}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal open={showPay} title="Pay via M-Pesa" onClose={() => { setShowPay(false); setPushResult(null); }}>
          <div className="space-y-4">
            <p className="text-sm text-gray">
              Balance: <span className="font-bold text-navy">{formatKES(selected.amount_expected - (selected.amount_paid ?? 0))}</span>
            </p>
            <label className="block text-sm font-medium">M-Pesa Phone Number</label>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray" />
              <input
                className="input flex-1"
                placeholder="07XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {pushResult && (
              <p className={`text-sm ${pushResult.startsWith('Error') ? 'text-red' : 'text-green'}`}>{pushResult}</p>
            )}
            <button className="btn w-full" onClick={handleStkPush} disabled={pushing || !phone}>
              {pushing ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Send STK Push'}
            </button>
          </div>
        </Modal>
      )}
    </Shell>
  );
}
