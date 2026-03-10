import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CurrencyInput } from "@/components/common/CurrencyInput";
import { KE_CONSTANTS } from "@/lib/constants";
import toast from "react-hot-toast";

const ProductForm = () => {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Product saved (stub)");
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Add / Edit Product</h1>
          <p className="text-sm text-slate-500">All fields required for accurate stock tracking.</p>
        </div>
        <Button form="product-form" type="submit">Save</Button>
      </div>

      <form id="product-form" onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input required placeholder="Unga wa Ngano 2kg" />
        </div>
        <div className="space-y-1">
          <Label>SKU / Barcode</Label>
          <Input placeholder="UNG-2KG" />
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <Select>
            <option>General</option>
            <option>Food</option>
            <option>Hardware</option>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Unit</Label>
          <Select>
            {KE_CONSTANTS.units.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Cost Price</Label>
          <CurrencyInput min={0} step={0.01} />
        </div>
        <div className="space-y-1">
          <Label>Selling Price</Label>
          <CurrencyInput min={0} step={0.01} />
        </div>
        <div className="space-y-1">
          <Label>Quantity in Stock</Label>
          <Input type="number" min={0} />
        </div>
        <div className="space-y-1">
          <Label>Reorder Level</Label>
          <Input type="number" min={0} />
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
