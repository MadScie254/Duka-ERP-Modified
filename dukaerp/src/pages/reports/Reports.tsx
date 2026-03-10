import { Button } from "@/components/ui/button";
import DataTable from "@/components/common/DataTable";

const Reports = () => {
  const reports = [
    { name: "Sales CSV", description: "Export last 30 days", action: "Download" },
    { name: "Inventory CSV", description: "Stock levels snapshot", action: "Download" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Export data for accountants or BI.</p>
        </div>
        <Button>Generate All</Button>
      </div>
      <div className="card p-4">
        <DataTable
          columns={[
            { header: "Report", accessor: "name" },
            { header: "Description", accessor: "description" },
            { header: "Action", accessor: "action" },
          ]}
          data={reports}
          emptyMessage="No reports"
        />
      </div>
    </div>
  );
};

export default Reports;
