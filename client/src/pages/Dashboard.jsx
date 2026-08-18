import { useEffect, useState } from "react";

import api from "../services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/manager");

      setDashboard(response.data.dashboard || null);
    } catch (error) {
      console.error("Failed to load manager dashboard:", error);

      setError(
        error.response?.data?.message || "Failed to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-teal-700">
            Restaurant Overview
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const inventory = dashboard?.inventory;
  const orders = dashboard?.orders;
  const purchase = dashboard?.purchase;
  const waste = dashboard?.waste;

  const purchaseItems = purchase?.shoppingList || [];

  const hasPurchaseItems = purchaseItems.length > 0;

  return (
    <div className="space-y-6">
      {/* =========================================================
          HEADER
      ========================================================== */}
      <div>
        <p className="text-sm font-medium text-teal-700">Restaurant Overview</p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor your restaurant operations from one place.
        </p>
      </div>

      {/* =========================================================
          KPI CARDS
      ========================================================== */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Inventory */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Inventory Items
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {inventory?.totalIngredients ?? 0}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Total ingredients tracked
          </p>
        </div>

        {/* Low Stock */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Low Stock
          </p>

          <p className="mt-2 text-2xl font-semibold text-orange-500">
            {inventory?.lowStock ?? 0}
          </p>

          <p className="mt-1 text-xs text-slate-500">Items needing attention</p>
        </div>

        {/* Tomorrow Demand */}
        <div className="rounded-xl border border-teal-100 bg-teal-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
            Tomorrow Forecast
          </p>

          <p className="mt-2 text-2xl font-semibold text-teal-700">
            {orders?.predictedTomorrowOrders ?? 0}
          </p>

          <p className="mt-1 text-xs text-teal-600">Predicted orders</p>
        </div>

        {/* Waste Loss */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Waste Cost Loss
          </p>

          <p className="mt-2 text-2xl font-semibold text-red-600">
            ₹{waste?.totalCostLoss ?? 0}
          </p>

          <p className="mt-1 text-xs text-slate-500">Recorded financial loss</p>
        </div>
      </div>

      {/* =========================================================
          OPERATIONAL OVERVIEW
      ========================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Operational Overview
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current restaurant status based on inventory, demand, purchasing and
            waste.
          </p>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Demand */}
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Demand
            </p>

            <p className="mt-2 text-xl font-semibold text-slate-900">
              {orders?.predictedTomorrowOrders ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Tomorrow's predicted orders
            </p>
          </div>

          {/* Inventory */}
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Inventory
            </p>

            <p className="mt-2 text-xl font-semibold text-slate-900">
              {inventory?.lowStock ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">Low-stock ingredients</p>
          </div>

          {/* Purchasing */}
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Purchasing
            </p>

            <p className="mt-2 text-xl font-semibold text-slate-900">
              {purchaseItems.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Items requiring purchase
            </p>
          </div>

          {/* Waste */}
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Waste
            </p>

            <p className="mt-2 text-xl font-semibold text-red-600">
              ₹{waste?.totalCostLoss ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">Total recorded loss</p>
          </div>
        </div>
      </section>

      {/* =========================================================
          DEMAND + INVENTORY
      ========================================================== */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Demand Forecast */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Demand Forecast
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Recent order activity and tomorrow's prediction.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Last 7 Days
              </p>

              <p className="mt-2 text-xl font-semibold text-slate-900">
                {orders?.totalOrders ?? 0}
              </p>

              <p className="mt-1 text-xs text-slate-500">Total orders</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Daily Average
              </p>

              <p className="mt-2 text-xl font-semibold text-slate-900">
                {orders?.averageDailyOrders ?? 0}
              </p>

              <p className="mt-1 text-xs text-slate-500">Orders per day</p>
            </div>

            <div className="rounded-lg bg-teal-50 p-3">
              <p className="text-xs uppercase tracking-wide text-teal-600">
                Tomorrow
              </p>

              <p className="mt-2 text-xl font-semibold text-teal-700">
                {orders?.predictedTomorrowOrders ?? 0}
              </p>

              <p className="mt-1 text-xs text-teal-600">Predicted orders</p>
            </div>
          </div>
        </section>

        {/* Inventory Health */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Inventory Health
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current inventory availability.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Total Items
              </p>

              <p className="mt-2 text-xl font-semibold text-slate-900">
                {inventory?.totalIngredients ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Low Stock
              </p>

              <p className="mt-2 text-xl font-semibold text-orange-500">
                {inventory?.lowStock ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Out of Stock
              </p>

              <p className="mt-2 text-xl font-semibold text-red-600">
                {inventory?.outOfStock ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Expiring Soon
              </p>

              <p className="mt-2 text-xl font-semibold text-orange-500">
                {inventory?.expiringSoon ?? 0}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          PURCHASE + WASTE
      ========================================================== */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Purchase Recommendation */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Purchase Recommendation
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Ingredients that may need to be purchased.
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {purchaseItems.length} items
            </span>
          </div>

          {hasPurchaseItems ? (
            <div className="divide-y divide-slate-100">
              {purchaseItems.map((item) => (
                <div
                  key={item.ingredient}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {item.ingredient}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Buy {item.buy} {item.baseUnit}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    ₹{item.estimatedCost}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-teal-700">
                Inventory is sufficient
              </p>

              <p className="mt-1 text-xs text-slate-500">
                No immediate purchases are required.
              </p>
            </div>
          )}
        </section>

        {/* Waste Summary */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Waste Summary
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current food waste performance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Waste Events
              </p>

              <p className="mt-2 text-xl font-semibold text-slate-900">
                {waste?.totalWasteEvents ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Quantity Wasted
              </p>

              <p className="mt-2 text-xl font-semibold text-slate-900">
                {waste?.totalQuantityWasted ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Cost Loss
              </p>

              <p className="mt-2 text-xl font-semibold text-red-600">
                ₹{waste?.totalCostLoss ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Most Wasted
              </p>

              <p className="mt-2 text-xl font-semibold text-slate-900">
                {waste?.mostWastedIngredient || "—"}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          OVERALL STATUS
      ========================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Operational Status
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Quick assessment of your current restaurant operations.
          </p>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {hasPurchaseItems ? "Attention Required" : "Operations Ready"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {hasPurchaseItems
                  ? "Some ingredients may need to be purchased."
                  : "No immediate purchasing action is required."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              Demand Forecast
            </span>

            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              Inventory
            </span>

            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              Purchasing
            </span>

            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              Waste
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
