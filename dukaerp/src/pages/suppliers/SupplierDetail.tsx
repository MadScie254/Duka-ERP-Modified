import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SupplierDetail = () => {
  const { id } = useParams();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Supplier</p>
          <h1 className="text-2xl font-bold text-slate-900">{id}</h1>
        </div>
        <Button>Create PO</Button>
      </div>
      <div className="card p-4 space-y-2">
        <p className="text-sm text-slate-600">Contact: 0700998877</p>
        <p className="text-sm text-slate-600">Email: supplier@example.com</p>
        <p className="text-sm text-slate-600">Notes: Delivers weekly on Mondays.</p>
      </div>
    </div>
  );
};

export default SupplierDetail;
