import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import toast from "react-hot-toast";

const StockAdjustment = () => {
  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Stock adjustment recorded (stub)");
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Adjustment</h1>
          <p className="text-sm text-slate-500">Capture accurate counts with reasons for audit trail.</p>
        </div>
        <Button form="adjust-form" type="submit">Save</Button>
      </div>
      <form id="adjust-form" onSubmit={handleAdjust} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Product</Label>
          <Select>
            <option>Product A</option>
            <option>Product B</option>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>New Count</Label>
          <Input type="number" min={0} required />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Reason</Label>
          <Select required>
            <option>Damage</option>
            <option>Count correction</option>
            <option>Theft</option>
            <option>Other</option>
          </Select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Notes</Label>
          <Input placeholder="Optional notes" />
        </div>
      </form>
    </div>
  );
};

export default StockAdjustment;
