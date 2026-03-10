import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";

const suppliers = [
  { name: "Unga Millers", phone: "0722001100", notes: "Main flour supplier" },
  { name: "Best Beverages", phone: "0700998877", notes: "Delivers weekly" },
];

const Suppliers = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Suppliers</h1>
        <p className="text-sm text-slate-500">Track purchase orders and deliveries.</p>
      </div>
      <Button>Add supplier</Button>
    </div>
    <div className="card p-4">
      <DataTable
        columns={[
          { header: "Name", accessor: "name" },
          { header: "Phone", accessor: "phone" },
          { header: "Notes", accessor: "notes" },
        ]}
        data={suppliers}
        emptyMessage="No suppliers"
      />
    </div>
  </div>
);

export default Suppliers;
