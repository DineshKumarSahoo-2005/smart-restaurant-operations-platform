import { Bell, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

function Navbar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-medium text-slate-900">
            Restaurant Operations
          </p>

          <p className="text-xs text-slate-500">
            Manage your restaurant from one place
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
        >
          <Search size={16} strokeWidth={1.8} />

          <span>Search</span>

          <kbd className="ml-2 hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline">
            /
          </kbd>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell size={19} strokeWidth={1.8} />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        {/* Divider */}
        <div className="h-7 w-px bg-slate-200" />

        {/* User */}
        <button type="button" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {user?.name
              ? user.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "RA"}
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-900">
              {user?.name || "Restaurant Admin"}
            </p>

            <p className="text-xs text-slate-500">
              {user?.role || "Administrator"}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
