import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  const [inventory, setInventory] = useState(null);
  const [orders, setOrders] = useState([]);
  const [waste, setWaste] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [inventoryRes, ordersRes, wasteRes] = await Promise.all([
          api.get("/inventory/dashboard"),
          api.get("/orders"),
          api.get("/waste/dashboard"),
        ]);

        setInventory(inventoryRes.data.dashboard);
        setOrders(ordersRes.data.orders || []);
        setWaste(wasteRes.data.dashboard);
      } catch (error) {
        console.error("Dashboard loading failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-teal-700">Overview</p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Good to see you, {user?.name?.split(" ")[0] || "there"}.
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening across your restaurant today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={orders.length}
          description="All recorded orders"
        />

        <StatCard
          label="Low Stock"
          value={inventory?.lowStock ?? 0}
          description="Items need attention"
          accent="warning"
        />

        <StatCard
          label="Out of Stock"
          value={inventory?.outOfStock ?? 0}
          description="Items unavailable"
          accent="danger"
        />

        <StatCard
          label="Expiring Soon"
          value={inventory?.expiringSoon ?? 0}
          description="Check expiry dates"
          accent="warning"
        />
      </div>

      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Recent Orders */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Recent Orders
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest restaurant orders
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {order.items?.length || 0} item(s)
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    ₹{order.totalAmount ?? 0}
                  </p>

                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-slate-500">No orders found.</p>
              </div>
            )}
          </div>
        </section>

        {/* Inventory */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Inventory Health
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current stock overview
            </p>
          </div>

          <div className="space-y-5 px-6 py-6">
            <InventoryRow
              label="Total Ingredients"
              value={inventory?.totalIngredients ?? 0}
            />

            <InventoryRow
              label="Low Stock"
              value={inventory?.lowStock ?? 0}
              warning
            />

            <InventoryRow
              label="Out of Stock"
              value={inventory?.outOfStock ?? 0}
              danger
            />

            <InventoryRow
              label="Expiring Soon"
              value={inventory?.expiringSoon ?? 0}
              warning
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, description, accent }) => {
  const accentClass =
    accent === "danger"
      ? "text-red-600"
      : accent === "warning"
        ? "text-amber-600"
        : "text-teal-700";

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className={`mt-3 text-2xl font-semibold ${accentClass}`}>{value}</p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
};

const InventoryRow = ({ label, value, warning, danger }) => {
  const valueClass = danger
    ? "text-red-600"
    : warning
      ? "text-amber-600"
      : "text-slate-900";

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>

      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",

    Preparing: "bg-blue-50 text-blue-700 border-blue-200",

    Ready: "bg-emerald-50 text-emerald-700 border-emerald-200",

    Completed: "bg-slate-100 text-slate-700 border-slate-200",

    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        styles[status] || "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default Dashboard;
