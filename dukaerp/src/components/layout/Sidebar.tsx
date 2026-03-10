import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Users,
  PiggyBank,
  Wallet,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", to: "/inventory", icon: Boxes },
  { label: "POS", to: "/pos", icon: ShoppingBag },
  { label: "Sales", to: "/sales", icon: Wallet },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Suppliers", to: "/suppliers", icon: PiggyBank },
  { label: "Expenses", to: "/expenses", icon: Wallet },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Reports", to: "/reports", icon: FileText },
  { label: "Settings", to: "/settings", icon: Settings },
];

const Sidebar = () => {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  return (
    <aside
      className={cn(
        "hidden md:flex h-screen flex-col bg-white border-r border-slate-200 w-60 transition-all duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="p-6 border-b border-slate-200">
        <div className="text-xl font-bold text-brand-700">DukaERP</div>
        <p className="text-xs text-slate-500">Run your shop smart</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50",
                  isActive && "bg-brand-50 text-brand-700 border-r-4 border-brand-500"
                )
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
