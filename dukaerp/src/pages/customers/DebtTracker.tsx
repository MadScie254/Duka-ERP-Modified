import DataTable from "@/components/common/DataTable";
import StatCard from "@/components/common/StatCard";

const debts = [
  { customer: "Kamau", amount: "KES 3,400", due: "2026-03-15", days: 5 },
  { customer: "Amina", amount: "KES 1,200", due: "2026-03-02", days: 8 },
  { customer: "Wanjiku", amount: "KES 4,800", due: "2026-02-10", days: 29 },
];

const DebtTracker = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Debt Tracker</h1>
        <StatCard title="Outstanding" value={9400} hint="Across 3 customers" />
      </div>
      <div className="card p-4">
        <DataTable
          columns={[
            { header: "Customer", accessor: "customer" },
            { header: "Amount", accessor: "amount" },
            { header: "Due", accessor: "due" },
            { header: "Days Overdue", accessor: "days" },
          ]}
          data={debts}
          emptyMessage="No debts recorded"
        />
      </div>
    </div>
  );
};

export default DebtTracker;
