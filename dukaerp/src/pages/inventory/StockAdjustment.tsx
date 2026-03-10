import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import toast from "react-hot-toast";
import type { MovementType } from "@/types";

const movementTypes: { value: MovementType; label: string }[] = [
  { value: "adjustment", label: "Count correction" },
  { value: "damage", label: "Damage" },
  { value: "return", label: "Return" },
  { value: "purchase", label: "Restock / Purchase" },
  { value: "transfer", label: "Transfer" },
];

const StockAdjustment = () => {
  const navigate = useNavigate();
  const { products, adjustStock } = useInventory();
  const [productId, setProductId] = useState("");
  const [newCount, setNewCount] = useState("");
  const [type, setType] = useState<MovementType>("adjustment");
  const [notes, setNotes] = useState("");

  const selectedProduct = (products.data ?? []).find((p) => p.id === productId);

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    adjustStock.mutate(
      {
        product_id: productId,
        previous_quantity: selectedProduct.quantity_in_stock,
        new_quantity: Number(newCount),
        type,
        notes: notes || undefined,
      },
      {
        onSuccess: () => { toast.success("Stock adjusted"); navigate("/inventory"); },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Adjustment</h1>
          <p className="text-sm text-slate-500">Capture accurate counts with reasons for audit trail.</p>
        </div>
        <Button form="adjust-form" type="submit" disabled={adjustStock.isPending}>
          {adjustStock.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
      <form id="adjust-form" onSubmit={handleAdjust} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Product</Label>
          <Select value={productId} onChange={(e) => setProductId(e.target.value)} required>
            <option value="">-- Select product --</option>
            {(products.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (current: {p.quantity_in_stock})
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>New Count</Label>
          <Input type="number" min={0} required value={newCount} onChange={(e) => setNewCount(e.target.value)} />
          {selectedProduct && (
            <p className="text-xs text-slate-500">Current stock: {selectedProduct.quantity_in_stock}</p>
          )}
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Reason</Label>
          <Select required value={type} onChange={(e) => setType(e.target.value as MovementType)}>
            {movementTypes.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Notes</Label>
          <Input placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </form>
    </div>
  );
};

export default StockAdjustment;
