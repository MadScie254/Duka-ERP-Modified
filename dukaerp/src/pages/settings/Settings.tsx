import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KE_CONSTANTS } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const Settings = () => {
  const { activeShop, setActiveShop } = useAuthStore();
  const [name, setName] = useState(activeShop?.name ?? "");
  const [phone, setPhone] = useState(activeShop?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!activeShop) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("shops")
      .update({ name, phone })
      .eq("id", activeShop.id)
      .select()
      .single();
    if (error) {
      toast.error(error.message);
    } else {
      setActiveShop(data);
      toast.success("Settings saved");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">Shop profile, billing, plan limits.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      <div className="card p-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Shop Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mama Wanjiku" />
        </div>
        <div className="space-y-1">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" />
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
