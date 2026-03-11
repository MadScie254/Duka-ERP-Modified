import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import type { MaintenanceRequest } from '../../lib/types';
import { Shell } from '../../components/layout/Shell';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { ChartCard } from '../../components/ui/ChartCard';
import { StatCard } from '../../components/ui/StatCard';
import { formatDate } from '../../lib/formatters';
import { Wrench, Plus } from 'lucide-react';
import { CHART_COLORS, PIE_PALETTE, STATUS_COLORS } from '../../lib/chartColors';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const priorityTone = (p: string) => {
  if (p === 'low') return 'default' as const;
  if (p === 'medium') return 'info' as const;
  if (p === 'high') return 'warning' as const;
  return 'danger' as const;
};

const statusTone = (s: string) => {
  if (s === 'resolved' || s === 'closed') return 'success' as const;
  if (s === 'in_progress' || s === 'awaiting_parts') return 'warning' as const;
  return 'info' as const;
};

type Form = {
  property_id: string;
  unit_id: string;
  category: MaintenanceRequest['category'];
  title: string;
  description: string;
  priority: MaintenanceRequest['priority'];
};

const emptyForm: Form = {
  property_id: '',
  unit_id: '',
  category: 'plumbing',
  title: '',
  description: '',
  priority: 'medium',
};

export function MaintenancePage() {
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role ?? 'tenant';
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [units, setUnits] = useState<{ id: string; unit_number: string }[]>([]);

  // Analytics state
  const [catData, setCatData] = useState<{ name: string; value: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [avgResolution, setAvgResolution] = useState<number | null>(null);
  const [openCount, setOpenCount] = useState(0);

  const fetchRequests = async () => {
    setLoading(true);
    const q = supabase
      .from('maintenance_requests')
      .select('*, properties(name), units(unit_number), reporter:profiles!maintenance_requests_reported_by_fkey(full_name)')
      .order('created_at', { ascending: false });

    if (role === 'tenant' && profile) {
      q.eq('reported_by', profile.id);
    }

    const { data } = await q;
    setRequests((data ?? []) as MaintenanceRequest[]);
    setLoading(false);
  };

  useEffect(() => {
    const q = supabase
      .from('maintenance_requests')
      .select('*, properties(name), units(unit_number), reporter:profiles!maintenance_requests_reported_by_fkey(full_name)')
      .order('created_at', { ascending: false });
    if (role === 'tenant' && profile) {
      q.eq('reported_by', profile.id);
    }
    q.then(({ data }) => {
      const reqs = (data ?? []) as MaintenanceRequest[];
      setRequests(reqs);
      setLoading(false);

      // Compute analytics
      const catMap = new Map<string, number>();
      const statMap = new Map<string, number>();
      let totalRes = 0;
      let resCount = 0;
      let opens = 0;
      for (const r of reqs) {
        catMap.set(r.category, (catMap.get(r.category) ?? 0) + 1);
        statMap.set(r.status, (statMap.get(r.status) ?? 0) + 1);
        if (r.status === 'open' || r.status === 'in_progress') opens++;
        if (r.resolved_at && r.opened_at) {
          totalRes += (new Date(r.resolved_at).getTime() - new Date(r.opened_at).getTime()) / 86400000;
          resCount++;
        }
      }
      setCatData([...catMap.entries()].map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })));
      setStatusData([...statMap.entries()].map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })));
      setAvgResolution(resCount > 0 ? Math.round(totalRes / resCount) : null);
      setOpenCount(opens);
    });
    supabase.from('properties').select('id, name').eq('status', 'active').order('name')
      .then(({ data }) => { setProperties(data ?? []); });
  }, [role, profile]);

  useEffect(() => {
    if (!form.property_id) return;
    supabase.from('units').select('id, unit_number').eq('property_id', form.property_id).order('unit_number')
      .then(({ data }) => { setUnits(data ?? []); });
  }, [form.property_id]);

  const handleSubmit = async () => {
    if (!form.title || !form.property_id) return;
    setSaving(true);
    await supabase.from('maintenance_requests').insert({
      property_id: form.property_id,
      unit_id: form.unit_id || null,
      reported_by: profile?.id,
      category: form.category,
      title: form.title,
      description: form.description || null,
      priority: form.priority,
    });
    setSaving(false);
    setShowModal(false);
    setForm(emptyForm);
    setLoading(true);
    fetchRequests();
  };

  const categories: MaintenanceRequest['category'][] = ['plumbing', 'electrical', 'structural', 'appliance', 'security', 'cleaning', 'pest_control', 'other'];

  return (
    <Shell title="Maintenance" role={role}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray">{requests.length} request{requests.length !== 1 ? 's' : ''}</p>
        <button className="btn flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Request
        </button>
      </div>

      {loading ? (
        <div className="card p-6 text-center text-gray">Loading...</div>
      ) : requests.length === 0 ? (
        <EmptyState icon={<Wrench size={40} />} title="No requests" description="Submit a maintenance request to get started." action={<button className="btn" onClick={() => setShowModal(true)}>New Request</button>} />
      ) : (
        <>
          {/* ── Analytics strip ── */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <StatCard label="Open / In Progress" value={String(openCount)} tone={openCount > 2 ? 'danger' : openCount > 0 ? 'warning' : 'success'} />
            <StatCard label="Total Requests" value={String(requests.length)} />
            <StatCard label="Avg Resolution Time" value={avgResolution !== null ? `${avgResolution} days` : '—'} hint={avgResolution !== null && avgResolution > 7 ? 'Above 7-day target' : ''} tone={avgResolution !== null && avgResolution > 7 ? 'warning' : 'default'} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <ChartCard title="By Category" subtitle="Request distribution by type">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={catData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Requests" fill={CHART_COLORS.blue} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="By Status" subtitle="Current status breakdown">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3} label={({ name, value }) => `${name} (${value})`}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name.replace(/ /g, '_')] ?? PIE_PALETTE[i % PIE_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Request cards ── */}
          <h3 className="text-sm font-semibold mb-3">All Requests</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r) => {
            const prop = r.property as unknown as { name: string } | null;
            const unit = r.unit as unknown as { unit_number: string } | null;
            const reporter = r.reporter as unknown as { full_name: string } | null;
            return (
              <div key={r.id} className="card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge tone={priorityTone(r.priority)}>{r.priority}</Badge>
                  <Badge tone={statusTone(r.status)}>{r.status.replace(/_/g, ' ')}</Badge>
                </div>
                <h3 className="font-semibold text-sm">{r.title}</h3>
                {r.description && <p className="text-xs text-gray line-clamp-2">{r.description}</p>}
                <div className="flex items-center justify-between text-xs text-gray">
                  <span>{prop?.name}{unit ? ` · ${unit.unit_number}` : ''}</span>
                  <span>{formatDate(r.created_at)}</span>
                </div>
                {reporter && <p className="text-xs text-gray">By: {reporter.full_name}</p>}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} title="New Maintenance Request" onClose={() => setShowModal(false)} wide>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Property *</label>
              <select className="input w-full" aria-label="Property" value={form.property_id} onChange={(e) => { setForm({ ...form, property_id: e.target.value, unit_id: '' }); if (!e.target.value) setUnits([]); }}>
                <option value="">Select property</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Unit</label>
              <select className="input w-full" aria-label="Unit" value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value })}>
                <option value="">Select unit (optional)</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.unit_number}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Category *</label>
              <select className="input w-full" aria-label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Form['category'] })}>
                {categories.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Priority *</label>
              <select className="input w-full" aria-label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Form['priority'] })}>
                {(['low', 'medium', 'high', 'emergency'] as const).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Title *</label>
              <input className="input w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Brief description" />
            </div>
            <div>
              <label className="text-xs font-medium">Details</label>
              <textarea className="input w-full" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed description..." />
            </div>
            <button className="btn w-full" onClick={handleSubmit} disabled={saving || !form.title || !form.property_id}>
              {saving ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
      </Modal>
    </Shell>
  );
}
