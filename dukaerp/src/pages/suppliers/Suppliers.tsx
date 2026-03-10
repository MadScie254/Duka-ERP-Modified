import { useState } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Suppliers = () => {
  const { suppliers, createSupplier } = useSuppliers();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", contact_person: "", notes: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSupplier.mutate(
      {
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        contact_person: form.contact_person || null,
        notes: form.notes || null,
      },
      {
        onSuccess: () => { toast.success("Supplier added"); setShowForm(false); setForm({ name: "", phone: "", email: "", contact_person: "", notes: "" }); },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-500">Track purchase orders and deliveries.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add supplier"}</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Name *</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Contact Person</Label>
            <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0722001100" />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Notes</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Delivery schedule, payment terms, etc." />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={createSupplier.isPending}>
              {createSupplier.isPending ? "Saving…" : "Save supplier"}
            </Button>
          </div>
        </form>
      )}

      <div className="card p-4">
        {suppliers.isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !(suppliers.data ?? []).length ? (
          <p className="text-sm text-slate-500">No suppliers</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.data!.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/suppliers/${s.id}`} className="text-brand-700 font-medium hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{s.contact_person ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{s.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">{s.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suppliers;
