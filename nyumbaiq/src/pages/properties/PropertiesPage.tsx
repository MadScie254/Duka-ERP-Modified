import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import type { Property } from '../../lib/types';
import { Shell } from '../../components/layout/Shell';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { CountySelect } from '../../components/ui/CountySelect';
import { EmptyState } from '../../components/ui/EmptyState';
import { Building2, Plus, MapPin } from 'lucide-react';

export function PropertiesPage() {
  const profile = useAuthStore((s) => s.profile);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const role = profile?.role ?? 'tenant';

  const loadProperties = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('properties')
      .select('*, units(count)')
      .order('created_at', { ascending: false });
    setProperties((data as Property[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    supabase
      .from('properties')
      .select('*, units(count)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProperties((data as Property[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <Shell title="Properties" role={role}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray">{properties.length} properties</p>
        {(role === 'admin' || role === 'landlord') && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} className="mr-1" /> Add Property
          </button>
        )}
      </div>

      {loading ? (
        <div className="card p-6 text-center text-gray">Loading properties...</div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={<Building2 size={40} />}
          title="No properties yet"
          description="Add your first property to start managing units and tenants."
          action={
            (role === 'admin' || role === 'landlord') ? (
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Property</button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray mt-0.5">
                    <MapPin size={12} />
                    <span>{p.county}{p.area_name ? `, ${p.area_name}` : ''}</span>
                  </div>
                </div>
                <Badge tone={p.status === 'active' ? 'success' : p.status === 'inactive' ? 'default' : 'warning'}>
                  {p.status}
                </Badge>
              </div>
              <div className="flex gap-4 text-xs text-gray mt-3">
                <span>{p.property_type}</span>
                <span>{p.total_units ?? '—'} units</span>
                {p.year_built && <span>Built {p.year_built}</span>}
              </div>
              {p.is_listed_publicly && (
                <Badge tone="info">Listed publicly</Badge>
              )}
            </div>
          ))}
        </div>
      )}

      <AddPropertyModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={loadProperties} />
    </Shell>
  );
}

function AddPropertyModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial' | 'mixed'>('residential');
  const [county, setCounty] = useState('');
  const [areaName, setAreaName] = useState('');
  const [address, setAddress] = useState('');
  const [totalUnits, setTotalUnits] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from('properties').insert({
      name,
      property_type: propertyType,
      county,
      area_name: areaName || null,
      address: address || null,
      total_units: totalUnits ? parseInt(totalUnits) : null,
      description: description || null,
      owner_id: useAuthStore.getState().profile?.id,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
    onClose();
    setName('');
    setCounty('');
    setAreaName('');
    setAddress('');
    setTotalUnits('');
    setDescription('');
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Property" wide>
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Property Name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunrise Apartments"
            className="w-full border border-border rounded-button px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/40" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as 'residential' | 'commercial' | 'mixed')}
              aria-label="Property type"
              className="w-full border border-border rounded-button px-3 py-2 bg-white">
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">County</label>
            <CountySelect value={county} onChange={setCounty} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Area / Estate</label>
            <input type="text" value={areaName} onChange={(e) => setAreaName(e.target.value)} placeholder="e.g. Kilimani"
              className="w-full border border-border rounded-button px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/40" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total Units</label>
            <input type="number" value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)} placeholder="e.g. 24"
              className="w-full border border-border rounded-button px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/40" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address"
            className="w-full border border-border rounded-button px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/40" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the property..."
            className="w-full border border-border rounded-button px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/40" />
        </div>
        {error && <p className="text-red text-sm">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
