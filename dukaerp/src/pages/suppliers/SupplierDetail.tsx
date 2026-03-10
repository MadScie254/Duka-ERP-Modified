import { useParams, Link } from "react-router-dom";
import { useSupplierDetail } from "@/hooks/useSuppliers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: supplier, isLoading } = useSupplierDetail(id ?? "");

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!supplier) return <p className="text-sm text-slate-500">Supplier not found.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Supplier</p>
          <h1 className="text-2xl font-bold text-slate-900">{supplier.name}</h1>
        </div>
        <Link to="/suppliers"><Button variant="outline">&larr; Back</Button></Link>
      </div>
      <div className="card p-4 grid gap-4 md:grid-cols-2">
        <div><p className="text-xs text-slate-500">Contact Person</p><p className="font-medium">{supplier.contact_person ?? "—"}</p></div>
        <div><p className="text-xs text-slate-500">Phone</p><p className="font-medium">{supplier.phone ?? "—"}</p></div>
        <div><p className="text-xs text-slate-500">Email</p><p className="font-medium">{supplier.email ?? "—"}</p></div>
        <div><p className="text-xs text-slate-500">Added</p><p className="font-medium">{formatDate(supplier.created_at)}</p></div>
        {supplier.notes && (
          <div className="md:col-span-2">
            <p className="text-xs text-slate-500">Notes</p>
            <p className="text-sm text-slate-700">{supplier.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierDetail;
