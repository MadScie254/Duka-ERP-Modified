import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KE_CONSTANTS } from "@/lib/constants";

const Settings = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">Shop profile, billing, plan limits.</p>
        </div>
        <Button>Save</Button>
      </div>
      <div className="card p-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Shop Name</Label>
          <Input placeholder="Mama Wanjiku" defaultValue="Demo Shop" />
        </div>
        <div className="space-y-1">
          <Label>Phone</Label>
          <Input placeholder="0712345678" />
        </div>
        <div className="space-y-1">
          <Label>Timezone</Label>
          <Input value={KE_CONSTANTS.timezone} disabled />
        </div>
        <div className="space-y-1">
          <Label>Plan</Label>
          <Input value="free" disabled />
        </div>
      </div>
    </div>
  );
};

export default Settings;
