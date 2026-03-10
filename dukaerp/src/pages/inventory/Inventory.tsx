import { useState } from "react";
import DataTable from "@/components/common/DataTable";
import SearchBar from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import { formatCurrency } from "@/lib/utils";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { products } = useInventory();

  const rows = (products.data ?? [])
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku ?? "").toLowerCase().includes(search.toLowerCase()) || (p.barcode ?? "").includes(search))
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku ?? "-",
      category: p.categories?.name ?? "Uncategorized",
      stock: p.quantity_in_stock,
      price: formatCurrency(p.selling_price),
      margin: `${Math.round(((p.selling_price - p.cost_price) / p.selling_price) * 100)}%`,
    }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500">{products.data?.length ?? 0} products tracked.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/inventory/adjust")}>Adjust stock</Button>
          <Button onClick={() => navigate("/inventory/new")}>Add product</Button>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <SearchBar placeholder="Search by name, SKU or barcode" onChange={setSearch} />
        <DataTable
          columns={[
            { header: "Name", accessor: "name" },
            { header: "SKU", accessor: "sku" },
            { header: "Category", accessor: "category" },
            { header: "Stock", accessor: "stock" },
            { header: "Price", accessor: "price" },
            { header: "Margin", accessor: "margin" },
          ]}
          data={rows}
          loading={products.isLoading}
          emptyMessage="No products yet"
        />
      </div>
    </div>
  );
};

export default Inventory;
