import { useParams, Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SaleDetail = () => {
  const { id } = useParams();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Receipt</p>
          <h1 className="text-2xl font-bold text-slate-900">{id}</h1>
        </div>
        <Button onClick={() => window.print()}>Print receipt</Button>
      </div>
      <div className="card p-4 space-y-3">
        <p className="text-sm text-slate-600">Customer: Walk-in</p>
        <p className="text-sm text-slate-600">Total: {formatCurrency(18450)}</p>
        <p className="text-sm text-slate-600">Status: Completed</p>
        <Link className="text-brand-700 text-sm font-semibold" to="/sales">
          Back to sales
        </Link>
      </div>
    </div>
  );
};

export default SaleDetail;
