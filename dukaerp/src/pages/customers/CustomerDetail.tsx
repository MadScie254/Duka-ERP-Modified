import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const CustomerDetail = () => {
  const { id } = useParams();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
          <h1 className="text-2xl font-bold text-slate-900">{id}</h1>
        </div>
        <Button>Record payment</Button>
      </div>
      <div className="card p-4 space-y-2">
        <p className="text-sm text-slate-600">Phone: 0712345678</p>
        <p className="text-sm text-slate-600">Total debt: {formatCurrency(1200)}</p>
        <p className="text-sm text-slate-600">Last visit: 3 days ago</p>
      </div>
    </div>
  );
};

export default CustomerDetail;
