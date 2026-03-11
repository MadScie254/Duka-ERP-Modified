import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import type { Unit, Property } from '../../lib/types';
import { Shell } from '../../components/layout/Shell';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatKES } from '../../lib/formatters';
import { DoorOpen, Plus } from 'lucide-react';

const unitTypeLabels: Record<string, string> = {
  bedsitter: 'Bedsitter', '1br': '1 Bedroom', '2br': '2 Bedroom', '3br': '3 Bedroom',
  penthouse: 'Penthouse', office: 'Office', warehouse: 'Warehouse', retail: 'Retail', studio: 'Studio',
};

const statusTone = (s: string) => {
  if (s === 'vacant') return 'success' as const;
  if (s === 'occupied') return 'info' as const;
  if (s === 'reserved') return 'warning' as const;
  return 'danger' as const;
};

export function UnitsPage() {
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role ?? 'tenant';
  const [units, setUnits] = useState<(Unit & { properties: Property })[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    const [u, p] = await Promise.all([
      supabase.from('units').select('*, properties(*)').order('created_at', { ascending: false }),
      supabase.from('properties').select('id, name').order('name'),
    ]);
    setUnits((u.data ?? []) as (Unit & { properties: Property })[]);
    setProperties((p.data ?? []) as Property[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <Shell title="Units" role={role}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray">{units.length} units</p>
        {(role === 'admin' || role === 'landlord') && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} className="mr-1" /> Add Unit
          </button>
        )}
      </div>

      {loading ? (
        <div className="card p-6 text-center text-gray">Loading...</div>
      ) : units.length === 0 ? (
        <EmptyState icon={<DoorOpen size={40} />} title="No units" description="Add units to your properties to start managing them." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-gray">
                <th className="py-2 pr-4">Unit</th>
                <th className="py-2 pr-4">Property</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Rent</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-bg/50">
                  <td className="py-2.5 pr-4 font-medium">{u.unit_number}{u.floor_number ? ` (Floor ${u.floor_number})` : ''}</td>
                  <td className="py-2.5 pr-4">{u.properties?.name ?? '—'}</td>
                  <td className="py-2.5 pr-4">{unitTypeLabels[u.unit_type] ?? u.unit_type}</td>
                  <td className="py-2.5 pr-4 font-medium">{formatKES(u.monthly_rent)}</td>
                  <td className="py-2.5 pr-4"><Badge tone={statusTone(u.status)}>{u.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddUnitModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={load} properties={properties} />
    </Shell>
  );
}

function AddUnitModal({ open, onClose, onSaved, properties }: { open: boolean; onClose: () => void; onSaved: () => void; properties: Property[] }) {
  const [propertyId, setPropertyId] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [unitType, setUnitType] = useState('1br');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from('units').insert({
      property_id: propertyId,
      unit_number: unitNumber,
      floor_number: floorNumber || null,
      unit_type: unitType,
      monthly_rent: parseFloat(monthlyRent),
      deposit_amount: depositAmount ? parseFloat(depositAmount) : null,
    });
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Unit">
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Property</label>
          <select required value={propertyId} onChange={(e) => setPropertyId(e.target.value)} aria-label="Property" className="w-full border border-border rounded-button px-3 py-2 bg-white">
            <option value="">Select property</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Unit Number</label>
            <input required value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} placeholder="e.g. A-201" className="w-full border border-border rounded-button px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Floor</label>
            <input value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} placeholder="e.g. 2" className="w-full border border-border rounded-button px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Unit Type</label>
          <select value={unitType} onChange={(e) => setUnitType(e.target.value)} aria-label="Unit type" className="w-full border border-border rounded-button px-3 py-2 bg-white">
            {Object.entries(unitTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Monthly Rent (KES)</label>
            <input required type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} placeholder="35000" className="w-full border border-border rounded-button px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deposit (KES)</label>
            <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="70000" className="w-full border border-border rounded-button px-3 py-2" />
          </div>
        </div>
        {error && <p className="text-red text-sm">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Unit'}</button>
        </div>
      </form>
    </Modal>
  );
}
