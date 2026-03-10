import { useState } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import SearchBar from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Customers = () => {
  const { customers, createCustomer } = useCustomers();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const filtered = (customers.data ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer.mutate(
      { name: form.name, phone: form.phone || undefined, email: form.email || undefined },
      {
        onSuccess: () => {
          toast.success("Customer added");
          setShowForm(false);
          setForm({ name: "", phone: "", email: "" });
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Loyalty, contact and debt tracking.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add customer"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label>Name *</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0712345678" />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? "Saving…" : "Save customer"}
            </Button>
          </div>
        </form>
      )}

      <div className="card p-4 space-y-3">
        <SearchBar placeholder="Search customers by name or phone" onChange={setSearch} />
        {customers.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !filtered.length ? (
          <p className="text-sm text-slate-500">No customers found</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Phone</th>
                  <th className="text-right px-4 py-3 font-semibold">Credit Limit</th>
                  <th className="text-right px-4 py-3 font-semibold">Debt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/customers/${c.id}`} className="text-brand-700 font-medium hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(c.credit_limit ?? 0)}</td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: (c.total_debt ?? 0) > 0 ? "#dc2626" : "#16a34a" }}>
                      {formatCurrency(c.total_debt ?? 0)}
                    </td>
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

export default Customers;
