import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Users,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/inventory", icon: Boxes, label: "Stock" },
  { to: "/pos", icon: ShoppingBag, label: "POS" },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

const MobileNav = () => (
  <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex justify-around py-2 shadow-sm">
    {items.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center text-xs text-slate-600 gap-1",
              isActive && "text-brand-700"
            )
          }
        >
          <Icon size={18} />
          {item.label}
        </NavLink>
      );
    })}
  </nav>
);

export default MobileNav;
