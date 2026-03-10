import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useInventory, useProduct } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CurrencyInput } from "@/components/common/CurrencyInput";
import { KE_CONSTANTS } from "@/lib/constants";
import toast from "react-hot-toast";

const ProductForm = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("id");
  const { categories, createProduct, updateProduct } = useInventory();
  const { data: existing } = useProduct(editId ?? "");

  const [form, setForm] = useState(() => ({
    name: existing?.name ?? "",
    sku: existing?.sku ?? "",
    barcode: existing?.barcode ?? "",
    category_id: existing?.category_id ?? "",
    unit: existing?.unit ?? "piece",
    cost_price: existing?.cost_price?.toString() ?? "",
    selling_price: existing?.selling_price?.toString() ?? "",
    stock_quantity: existing?.stock_quantity?.toString() ?? "0",
    reorder_level: existing?.reorder_level?.toString() ?? "5",
  }));

  // Sync form if editing and data loads after initial render
  const [synced, setSynced] = useState(false);
  if (existing && !synced) {
    setForm({
      name: existing.name,
      sku: existing.sku ?? "",
      barcode: existing.barcode ?? "",
      category_id: existing.category_id ?? "",
      unit: existing.unit ?? "piece",
      cost_price: existing.cost_price.toString(),
      selling_price: existing.selling_price.toString(),
      stock_quantity: existing.stock_quantity.toString(),
      reorder_level: (existing.reorder_level ?? 5).toString(),
    });
    setSynced(true);
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      sku: form.sku || undefined,
      barcode: form.barcode || undefined,
      category_id: form.category_id || undefined,
      unit: form.unit,
      cost_price: Number(form.cost_price),
      selling_price: Number(form.selling_price),
      stock_quantity: Number(form.stock_quantity),
      reorder_level: Number(form.reorder_level),
    };

    if (editId) {
      updateProduct.mutate(
        { id: editId, updates: payload },
        {
          onSuccess: () => { toast.success("Product updated"); navigate("/inventory"); },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => { toast.success("Product created"); navigate("/inventory"); },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{editId ? "Edit Product" : "Add Product"}</h1>
          <p className="text-sm text-slate-500">All fields required for accurate stock tracking.</p>
        </div>
        <Button form="product-form" type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      <form id="product-form" onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input required placeholder="Unga wa Ngano 2kg" value={form.name} onChange={set("name")} />
        </div>
        <div className="space-y-1">
          <Label>SKU / Barcode</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="SKU" value={form.sku} onChange={set("sku")} />
            <Input placeholder="Barcode" value={form.barcode} onChange={set("barcode")} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <Select value={form.category_id} onChange={set("category_id")}>
            <option value="">-- Select --</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Unit</Label>
          <Select value={form.unit} onChange={set("unit")}>
            {KE_CONSTANTS.units.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Cost Price</Label>
          <CurrencyInput min={0} value={form.cost_price} onChange={set("cost_price")} required />
        </div>
        <div className="space-y-1">
          <Label>Selling Price</Label>
          <CurrencyInput min={0} value={form.selling_price} onChange={set("selling_price")} required />
        </div>
        <div className="space-y-1">
          <Label>Quantity in Stock</Label>
          <Input type="number" min={0} value={form.stock_quantity} onChange={set("stock_quantity")} />
        </div>
        <div className="space-y-1">
          <Label>Reorder Level</Label>
          <Input type="number" min={0} value={form.reorder_level} onChange={set("reorder_level")} />
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
