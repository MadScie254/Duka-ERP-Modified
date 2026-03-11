import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import type { Listing } from '../../lib/types';
import { Shell } from '../../components/layout/Shell';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { formatKES, formatDate } from '../../lib/formatters';
import { Megaphone, Plus, Eye } from 'lucide-react';

type Form = {
  property_id: string;
  unit_id: string;
  title: string;
  description: string;
  listing_type: Listing['listing_type'];
  asking_price: string;
  negotiable: boolean;
  available_from: string;
};

const emptyForm: Form = {
  property_id: '',
  unit_id: '',
  title: '',
  description: '',
  listing_type: 'rent',
  asking_price: '',
  negotiable: true,
  available_from: '',
};

export function ListingsPage() {
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role ?? 'agent';
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [units, setUnits] = useState<{ id: string; unit_number: string }[]>([]);

  const fetchListings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('listings')
      .select('*, properties(name), units(unit_number)')
      .order('created_at', { ascending: false });
    setListings((data ?? []) as Listing[]);
    setLoading(false);
  };

  const fetchProperties = async () => {
    const { data } = await supabase.from('properties').select('id, name').eq('status', 'active').order('name');
    setProperties(data ?? []);
  };

  useEffect(() => { fetchListings(); fetchProperties(); }, []);

  useEffect(() => {
    if (!form.property_id) { setUnits([]); return; }
    (async () => {
      const { data } = await supabase.from('units').select('id, unit_number').eq('property_id', form.property_id).order('unit_number');
      setUnits(data ?? []);
    })();
  }, [form.property_id]);

  const handleSubmit = async () => {
    if (!form.title || !form.property_id) return;
    setSaving(true);
    await supabase.from('listings').insert({
      property_id: form.property_id,
      unit_id: form.unit_id || null,
      listed_by: profile?.id,
      title: form.title,
      description: form.description || null,
      listing_type: form.listing_type,
      asking_price: form.asking_price ? Number(form.asking_price) : null,
      negotiable: form.negotiable,
      available_from: form.available_from || null,
    });
    setSaving(false);
    setShowModal(false);
    setForm(emptyForm);
    fetchListings();
  };

  return (
    <Shell title="Listings" role={role}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
        <button className="btn flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Listing
        </button>
      </div>

      {loading ? (
        <div className="card p-6 text-center text-gray">Loading...</div>
      ) : listings.length === 0 ? (
        <EmptyState icon={<Megaphone size={40} />} title="No listings" description="Create a listing to attract tenants." action={{ label: 'New Listing', onClick: () => setShowModal(true) }} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => {
            const prop = l.property as unknown as { name: string } | null;
            const unit = l.unit as unknown as { unit_number: string } | null;
            return (
              <div key={l.id} className="card overflow-hidden">
                {l.cover_image_url ? (
                  <img src={l.cover_image_url} alt={l.title} className="h-36 w-full object-cover" />
                ) : (
                  <div className="h-36 bg-bg flex items-center justify-center">
                    <Megaphone size={32} className="text-gray/30" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge tone={l.is_active ? 'success' : 'default'}>{l.is_active ? 'Active' : 'Inactive'}</Badge>
                    <span className="text-xs text-gray capitalize">{l.listing_type}</span>
                  </div>
                  <h3 className="font-semibold text-sm">{l.title}</h3>
                  <p className="text-xs text-gray">{prop?.name}{unit ? ` · ${unit.unit_number}` : ''}</p>
                  {l.asking_price && <p className="font-bold text-sm text-green">{formatKES(l.asking_price)}</p>}
                  <div className="flex items-center justify-between text-xs text-gray">
                    <span className="flex items-center gap-1"><Eye size={12} />{l.views_count}</span>
                    <span>{formatDate(l.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title="New Listing" onClose={() => setShowModal(false)} wide>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Property *</label>
              <select className="input w-full" value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value, unit_id: '' })}>
                <option value="">Select property</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Unit</label>
              <select className="input w-full" value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value })}>
                <option value="">All units / general</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.unit_number}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Title *</label>
              <input className="input w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Spacious 2BR in Kilimani" />
            </div>
            <div>
              <label className="text-xs font-medium">Listing Type</label>
              <select className="input w-full" value={form.listing_type} onChange={(e) => setForm({ ...form, listing_type: e.target.value as Form['listing_type'] })}>
                {(['rent', 'sale', 'lease'] as const).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Asking Price (KES)</label>
              <input type="number" className="input w-full" value={form.asking_price} onChange={(e) => setForm({ ...form, asking_price: e.target.value })} placeholder="0" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.negotiable} onChange={(e) => setForm({ ...form, negotiable: e.target.checked })} />
              Negotiable
            </label>
            <div>
              <label className="text-xs font-medium">Available From</label>
              <input type="date" className="input w-full" value={form.available_from} onChange={(e) => setForm({ ...form, available_from: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Description</label>
              <textarea className="input w-full" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the listing..." />
            </div>
            <button className="btn w-full" onClick={handleSubmit} disabled={saving || !form.title || !form.property_id}>
              {saving ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </Modal>
      )}
    </Shell>
  );
}
