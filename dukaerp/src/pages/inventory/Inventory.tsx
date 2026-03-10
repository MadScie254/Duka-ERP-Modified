import { useState } from "react";
import DataTable from "@/components/common/DataTable";
import SearchBar from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockProducts = Array.from({ length: 8 }).map((_, i) => ({
  name: `Product ${i + 1}`,
  sku: `SKU-${100 + i}`,
  category: ["Food", "Drinks", "Household"][i % 3],
  stock: Math.round(Math.random() * 80),
  margin: `${10 + i * 2}%`,
}));

const Inventory = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const filtered = mockProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500">Track stock levels and margins.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/inventory/adjust")}>Adjust stock</Button>
          <Button onClick={() => navigate("/inventory/new")}>Add product</Button>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar placeholder="Search by name or SKU" onChange={setSearch} />
          <BadgeCheck className="text-brand-600" size={18} />
          <p className="text-xs text-slate-500">RLS enforced by shop_id</p>
        </div>
        <DataTable
          columns={[
            { header: "Name", accessor: "name" },
            { header: "SKU", accessor: "sku" },
            { header: "Category", accessor: "category" },
            { header: "Stock", accessor: "stock" },
            { header: "Margin", accessor: "margin" },
          ]}
          data={filtered}
          emptyMessage="No products yet"
        />
      </div>
    </div>
  );
};

export default Inventory;
