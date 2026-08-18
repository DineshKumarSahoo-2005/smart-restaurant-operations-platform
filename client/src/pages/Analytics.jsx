import { useEffect, useState } from "react";

import api from "../services/api";

function Analytics() {
  const [orderDemand, setOrderDemand] = useState(null);
  const [inventoryRecommendation, setInventoryRecommendation] = useState(null);
  const [purchaseRecommendation, setPurchaseRecommendation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [orderDemandResponse, inventoryResponse, purchaseResponse] =
        await Promise.all([
          api.get("/analytics/order-demand"),
          api.get("/analytics/inventory-recommendation"),
          api.get("/analytics/purchase-recommendation"),
        ]);

      setOrderDemand(orderDemandResponse.data.prediction || null);

      setInventoryRecommendation(inventoryResponse.data.recommendation || null);

      setPurchaseRecommendation(purchaseResponse.data.shopping || null);
    } catch (error) {
      console.error("Failed to load analytics:", error);

      setError(error.response?.data?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading analytics...</p>
      </div>
    );
  }

  const inventoryItems = inventoryRecommendation?.ingredients || [];

  const shoppingItems = purchaseRecommendation?.shoppingList || [];

  const needsReorder = inventoryItems.some(
    (item) => item.status === "Reorder Needed",
  );

  const hasPurchaseNeed = shoppingItems.length > 0;

  let operationalStatus = "Operations Ready";
  let operationalMessage = "No immediate inventory action is required.";

  if (hasPurchaseNeed) {
    operationalStatus = "Purchase Required";
    operationalMessage =
      "Some ingredients need to be purchased for the predicted demand.";
  } else if (needsReorder) {
    operationalStatus = "Inventory Attention";
    operationalMessage =
      "Some ingredients may not be sufficient for predicted demand.";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-teal-700">
          Business Intelligence
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Understand demand, inventory requirements, and purchasing needs.
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* 7 Day Orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            7-Day Orders
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {orderDemand?.totalOrders ?? 0}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Orders recorded in the last 7 days
          </p>
        </div>

        {/* Tomorrow Forecast */}
        <div className="rounded-xl border border-teal-100 bg-teal-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
            Tomorrow Forecast
          </p>

          <p className="mt-2 text-2xl font-semibold text-teal-700">
            {orderDemand?.predictedTomorrowOrders ?? 0}
          </p>

          <p className="mt-1 text-xs text-teal-600">Predicted orders</p>
        </div>

        {/* Stock Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Stock Status
          </p>

          <p
            className={`mt-2 text-xl font-semibold ${
              needsReorder ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {needsReorder ? "Attention Needed" : "Sufficient"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {inventoryItems.length} ingredients analyzed
          </p>
        </div>

        {/* Purchase Cost */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Purchase Cost
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            ₹{purchaseRecommendation?.totalEstimatedCost ?? 0}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Estimated required purchase cost
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Demand Forecast */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Demand Forecast
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Order activity and predicted demand for tomorrow.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          {/* Total Orders */}
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Last 7 Days
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {orderDemand?.totalOrders ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">Total orders</p>
          </div>

          {/* Average */}
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Daily Average
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {orderDemand?.averageDailyOrders ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">Orders per day</p>
          </div>

          {/* Prediction */}
          <div className="rounded-xl border border-teal-100 bg-teal-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
              Tomorrow
            </p>

            <p className="mt-2 text-2xl font-semibold text-teal-700">
              {orderDemand?.predictedTomorrowOrders ?? 0}
            </p>

            <p className="mt-1 text-xs text-teal-600">Predicted orders</p>
          </div>
        </div>
      </section>

      {/* Inventory Recommendation */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Inventory Recommendation
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Inventory requirements based on predicted demand.
            </p>
          </div>

          <span className="text-sm text-slate-500">
            {inventoryRecommendation?.ingredients?.length ?? 0} ingredients
          </span>
        </div>

        {inventoryRecommendation?.ingredients?.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-900">
              No recommendations available
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Inventory recommendations will appear here.
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
                    Required
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Available
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {inventoryRecommendation?.ingredients?.map((item) => (
                  <tr
                    key={item.ingredient}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {item.ingredient}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Inventory item
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {item.required} {item.baseUnit}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {item.available} {item.baseUnit}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                          item.status === "Enough Stock"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
            {purchaseRecommendation?.shoppingList?.length ?? 0} items
          </span>
        </div>

        {purchaseRecommendation?.shoppingList?.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-emerald-700">
              No purchases required
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Current inventory is sufficient for predicted demand.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Ingredient
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Available
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Required
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Buy
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Estimated Cost
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {purchaseRecommendation?.shoppingList?.map((item) => (
                    <tr
                      key={item.ingredient}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">
                          {item.ingredient}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {item.available} {item.baseUnit}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {item.required} {item.baseUnit}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {item.buy} {item.baseUnit}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        ₹{item.estimatedCost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-5">
              <span className="text-sm font-medium text-slate-600">
                Estimated Purchase Cost
              </span>

              <span className="text-lg font-semibold text-slate-900">
                ₹{purchaseRecommendation?.totalEstimatedCost ?? 0}
              </span>
            </div>
          </>
        )}
      </section>

      {/* Operational Summary */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Operational Summary
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current operational status based on predicted demand and inventory.
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            {/* Status */}
            <div>
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    hasPurchaseNeed || needsReorder
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {hasPurchaseNeed || needsReorder ? "!" : "✓"}
                </span>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {operationalStatus}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {operationalMessage}
                  </p>
                </div>
              </div>
            </div>

            {/* Indicators */}
            <div className="flex flex-wrap gap-3">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  orderDemand
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                Demand Forecast
              </span>

              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  !needsReorder
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                Inventory
              </span>

              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  !hasPurchaseNeed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                Purchasing
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Analytics;
