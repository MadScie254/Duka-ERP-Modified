import DataTable from "@/components/common/DataTable";
import SearchBar from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";

const customers = Array.from({ length: 6 }).map((_, i) => ({
  name: ["Wanjiku", "Kamau", "Amina", "Chebet", "Omondi", "Otieno"][i],
  phone: `07${1234567 + i}`,
  total_purchases: `KES ${(5000 + i * 900).toLocaleString("en-KE")}`,
  debt: i % 2 === 0 ? "KES 1,200" : "KES 0",
}));

const Customers = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Loyalty, contact and debt tracking.</p>
        </div>
        <Button>Add customer</Button>
      </div>
      <div className="card p-4 space-y-3">
        <SearchBar placeholder="Search customers" />
        <DataTable
          columns={[
            { header: "Name", accessor: "name" },
            { header: "Phone", accessor: "phone" },
            { header: "Total Purchases", accessor: "total_purchases" },
            { header: "Debt", accessor: "debt" },
          ]}
          data={customers}
          emptyMessage="No customers yet"
        />
      </div>
    </div>
  );
};

export default Customers;
