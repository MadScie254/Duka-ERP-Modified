import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const sales = Array.from({ length: 8 }).map((_, i) => ({
  id: `INV-2024-${String(1 + i).padStart(4, "0")}`,
  customer: ["Walk-in", "Jane", "Kamau"][i % 3],
  total: `KES ${(1500 + i * 320).toLocaleString("en-KE")}`,
  status: "completed",
}));

const Sales = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sales</h1>
          <p className="text-sm text-slate-500">All receipts with payment breakdown.</p>
        </div>
        <Button onClick={() => navigate("/pos")}>New Sale</Button>
      </div>
      <div className="card p-4">
        <DataTable
          columns={[
            { header: "Receipt", accessor: "id" },
            { header: "Customer", accessor: "customer" },
            { header: "Total", accessor: "total" },
            { header: "Status", accessor: "status" },
          ]}
          data={sales}
          emptyMessage="No sales yet"
        />
      </div>
    </div>
  );
};

export default Sales;
