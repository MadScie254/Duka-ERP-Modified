import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DataTable from "@/components/common/DataTable";

const expenses = [
  { description: "Rent", amount: "KES 25,000", method: "cash", date: "2026-03-01" },
  { description: "KPLC", amount: "KES 5,400", method: "mpesa", date: "2026-03-05" },
];

const Expenses = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500">Keep costs in check.</p>
        </div>
        <Button form="expense-form" type="submit">Quick add</Button>
      </div>
      <div className="card p-4 space-y-3">
        <form id="expense-form" className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1 md:col-span-2">
            <Label>Description</Label>
            <Input placeholder="e.g. Rent" required />
          </div>
          <div className="space-y-1">
            <Label>Amount</Label>
            <Input type="number" min={0} required />
          </div>
          <div className="space-y-1">
            <Label>Payment Method</Label>
            <Input placeholder="cash/mpesa/bank" required />
          </div>
        </form>
        <DataTable
          columns={[
            { header: "Description", accessor: "description" },
            { header: "Amount", accessor: "amount" },
            { header: "Method", accessor: "method" },
            { header: "Date", accessor: "date" },
          ]}
          data={expenses}
          emptyMessage="No expenses"
        />
      </div>
    </div>
  );
};

export default Expenses;
