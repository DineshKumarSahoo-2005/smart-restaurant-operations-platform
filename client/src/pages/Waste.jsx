import { useEffect, useState } from "react";

import api from "../services/api";

function Waste() {
  const [waste, setWaste] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [executiveDashboard, setExecutiveDashboard] = useState(null);
  const [inventory, setInventory] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    inventoryItem: "",
    quantity: "",
    reason: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWasteData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        wasteResponse,
        dashboardResponse,
        executiveResponse,
        inventoryResponse,
      ] = await Promise.all([
        api.get("/waste"),
        api.get("/waste/dashboard"),
        api.get("/waste/executive-dashboard"),
        api.get("/inventory"),
      ]);

      setWaste(wasteResponse.data.waste || []);
      setInventory(inventoryResponse.data.inventory || []);

      setDashboard(dashboardResponse.data.dashboard || null);

      setExecutiveDashboard(executiveResponse.data.dashboard || null);
    } catch (error) {
      console.error("Failed to load waste data:", error);

      setError(error.response?.data?.message || "Failed to load waste data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWaste = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await api.post("/waste", {
        inventoryItem: formData.inventoryItem,
        quantity: Number(formData.quantity),
        reason: formData.reason,
      });

      setFormData({
        inventoryItem: "",
        quantity: "",
        reason: "",
      });

      setShowForm(false);

      await loadWasteData();
    } catch (error) {
      console.error("Failed to record waste:", error);

      setError(error.response?.data?.message || "Failed to record waste.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadWasteData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading waste data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Waste Management</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Food Waste
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track food waste and monitor financial loss.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800"
        >
          + Record Waste
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Record Waste Form */}
      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Record Food Waste
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Record wasted inventory and update stock automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitWaste} className="space-y-5 px-6 py-6">
            {/* Inventory Item */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Ingredient
              </label>

              <select
                value={formData.inventoryItem}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inventoryItem: e.target.value,
                  })
                }
                required
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                <option value="">Select inventory item</option>

                {inventory.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.ingredientName} — {item.quantity} {item.baseUnit}{" "}
                    available
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Quantity
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: e.target.value,
                  })
                }
                placeholder="Enter quantity"
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />

              {formData.inventoryItem && (
                <p className="mt-1 text-xs text-slate-400">
                  Unit:{" "}
                  {
                    inventory.find(
                      (item) => item._id === formData.inventoryItem,
                    )?.baseUnit
                  }
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Reason
              </label>

              <select
                value={formData.reason}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reason: e.target.value,
                  })
                }
                required
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                <option value="">Select reason</option>

                <option value="Expired">Expired</option>
                <option value="Overcooked">Overcooked</option>
                <option value="Spillage">Spillage</option>
                <option value="Damaged">Damaged</option>
                <option value="Returned">Returned</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Recording..." : "Record Waste"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Waste Overview */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {/* Waste Events */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Waste Events
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {dashboard?.totalWasteEvents ?? 0}
          </p>

          <p className="mt-1 text-xs text-slate-500">Total recorded events</p>
        </div>

        {/* Quantity Wasted */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Quantity Wasted
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {dashboard?.totalQuantityWasted ?? 0}
          </p>

          <p className="mt-1 text-xs text-slate-500">Total quantity wasted</p>
        </div>

        {/* Cost Loss */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Cost Loss
          </p>

          <p className="mt-2 text-2xl font-semibold text-red-600">
            ₹{dashboard?.totalCostLoss ?? 0}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Estimated financial loss
          </p>
        </div>

        {/* Most Wasted Ingredient */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Most Wasted
          </p>

          <p className="mt-2 text-xl font-semibold text-slate-900">
            {dashboard?.mostWastedIngredient || "—"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Highest wasted ingredient
          </p>
        </div>

        {/* Common Reason */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Common Reason
          </p>

          <p className="mt-2 text-xl font-semibold text-slate-900">
            {dashboard?.mostCommonReason || "—"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Most frequent waste reason
          </p>
        </div>
      </div>

      {/* Waste History */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Waste History
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Track all recorded food waste.
            </p>
          </div>

          <span className="text-sm text-slate-500">{waste.length} records</span>
        </div>

        {waste.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-900">
              No waste records yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Recorded food waste will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Ingredient
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Quantity
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Reason
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Cost Loss
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Recorded By
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {waste.map((item) => (
                  <tr key={item._id} className="transition hover:bg-slate-50">
                    {/* Ingredient */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {item.ingredientName}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Inventory item
                      </p>
                    </td>

                    {/* Quantity */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {item.quantity} {item.baseUnit}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {item.reason}
                      </span>
                    </td>

                    {/* Cost Loss */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-red-600">
                        ₹{item.costLoss}
                      </span>
                    </td>

                    {/* Recorded By */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {item.createdBy?.name || "Unknown"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.createdBy?.email || ""}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Executive Waste Dashboard */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Waste Performance
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Monitor waste trends and financial impact.
          </p>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          {/* Today */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Today
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {executiveDashboard?.today?.events ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">waste events</p>

            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-400">Cost Loss</p>

              <p className="mt-1 text-sm font-semibold text-red-600">
                ₹{executiveDashboard?.today?.costLoss ?? 0}
              </p>
            </div>
          </div>

          {/* This Week */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              This Week
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {executiveDashboard?.thisWeek?.events ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">waste events</p>

            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-400">Cost Loss</p>

              <p className="mt-1 text-sm font-semibold text-red-600">
                ₹{executiveDashboard?.thisWeek?.costLoss ?? 0}
              </p>
            </div>
          </div>

          {/* This Month */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              This Month
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {executiveDashboard?.thisMonth?.events ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">waste events</p>

            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-400">Cost Loss</p>

              <p className="mt-1 text-sm font-semibold text-red-600">
                ₹{executiveDashboard?.thisMonth?.costLoss ?? 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Wasted Ingredients */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Top Wasted Ingredients
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Ingredients contributing the most to food waste.
            </p>
          </div>

          <span className="text-xs text-slate-400">Top 5</span>
        </div>

        {executiveDashboard?.topIngredients?.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {executiveDashboard.topIngredients.map((ingredient, index) => (
              <div
                key={ingredient._id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {index + 1}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {ingredient._id}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Highest waste contribution
                    </p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-700">
                  {ingredient.quantity}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-slate-500">
              No waste analytics available yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Waste;
