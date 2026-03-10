import { Menu, Bell, Sun, Moon } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/utils";
import React from "react";

const Topbar: React.FC = () => {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const profile = useAuthStore((s) => s.profile);

  const today = formatDate(new Date());

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 gap-4">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden rounded-lg border border-slate-200 p-2"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Today</p>
            <p className="text-sm font-semibold">{today}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-lg border border-slate-200 p-2"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="rounded-lg border border-slate-200 p-2" aria-label="Notifications">
            <Bell size={16} />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-2 border border-brand-100">
            <div className="h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
              {(profile?.full_name || "DU").slice(0, 2).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{profile?.full_name || "Demo User"}</p>
              <p className="text-xs text-slate-500">{profile?.plan || "free"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
