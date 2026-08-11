import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Package,
  BookOpen,
  Trash2,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    path: "/orders",
    icon: ShoppingCart,
  },
  {
    label: "Menu",
    path: "/menu",
    icon: Utensils,
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: Package,
  },
  {
    label: "Recipes",
    path: "/recipes",
    icon: BookOpen,
  },
  {
    label: "Waste",
    path: "/waste",
    icon: Trash2,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
];

function Sidebar() {
  const { logout } = useAuth();
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Smart Restaurant
          </h1>

          <p className="mt-0.5 text-xs text-slate-500">Operations Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.8} className="shrink-0" />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-200 p-3">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <Settings size={18} strokeWidth={1.8} />

          <span>Settings</span>
        </NavLink>

        <button
          type="button"
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut size={18} strokeWidth={1.8} />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
