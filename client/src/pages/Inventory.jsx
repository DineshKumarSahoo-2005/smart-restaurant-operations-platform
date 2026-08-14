import { useEffect, useState } from "react";
import api from "../services/api";

function Inventory() {
  const [inventory, setInventory] = useState([]);

  const [stats, setStats] = useState({
    totalIngredients: 0,
    lowStock: 0,
    outOfStock: 0,
    expiringSoon: 0,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    ingredientName: "",
    quantity: "",
    baseUnit: "g",
    minimumStock: "",
    expiryDate: "",
    costPerUnit: "",
  });

  const [formLoading, setFormLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const [inventoryResponse, dashboardResponse] = await Promise.all([
        api.get("/inventory"),
        api.get("/inventory/dashboard"),
      ]);

      setInventory(inventoryResponse.data.inventory || []);

      setStats(
        dashboardResponse.data.dashboard || {
          totalIngredients: 0,
          lowStock: 0,
          outOfStock: 0,
          expiringSoon: 0,
        },
      );
    } catch (error) {
      console.error("Failed to load inventory:", error);

      setError(error.response?.data?.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = async (event) => {
    event.preventDefault();
    if (Number(formData.quantity) < 0) {
      setError("Quantity cannot be negative.");
      return;
    }

    if (Number(formData.minimumStock || 0) < 0) {
      setError("Minimum stock cannot be negative.");
      return;
    }

    if (Number(formData.costPerUnit) < 0) {
      setError("Cost per unit cannot be negative.");
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      await api.post("/inventory", {
        ingredientName: formData.ingredientName.trim(),
        quantity: Number(formData.quantity),
        baseUnit: formData.baseUnit,
        minimumStock: Number(formData.minimumStock || 0),
        expiryDate: formData.expiryDate || undefined,
        costPerUnit: Number(formData.costPerUnit),
      });

      setFormData({
        ingredientName: "",
        quantity: "",
        baseUnit: "g",
        minimumStock: "",
        expiryDate: "",
        costPerUnit: "",
      });

      setShowForm(false);

      await loadInventory();
    } catch (error) {
      console.error("Failed to add ingredient:", error);

      setError(error.response?.data?.message || "Failed to add ingredient.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditIngredient = async (event) => {
    event.preventDefault();
    if (Number(formData.quantity) < 0) {
      setError("Quantity cannot be negative.");
      return;
    }

    if (Number(formData.minimumStock || 0) < 0) {
      setError("Minimum stock cannot be negative.");
      return;
    }

    if (Number(formData.costPerUnit) < 0) {
      setError("Cost per unit cannot be negative.");
      return;
    }

    if (!editingItem) return;

    try {
      setFormLoading(true);
      setError("");

      await api.put(`/inventory/${editingItem._id}`, {
        ingredientName: formData.ingredientName.trim(),
        quantity: Number(formData.quantity),
        baseUnit: formData.baseUnit,
        minimumStock: Number(formData.minimumStock || 0),
        expiryDate: formData.expiryDate || undefined,
        costPerUnit: Number(formData.costPerUnit),
      });

      setFormData({
        ingredientName: "",
        quantity: "",
        baseUnit: "g",
        minimumStock: "",
        expiryDate: "",
        costPerUnit: "",
      });

      setEditingItem(null);
      setShowForm(false);

      await loadInventory();
    } catch (error) {
      console.error("Failed to update ingredient:", error);

      setError(error.response?.data?.message || "Failed to update ingredient.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteIngredient = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ingredient?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/inventory/${id}`);

      await loadInventory();
    } catch (error) {
      console.error("Failed to delete ingredient:", error);

      setError(error.response?.data?.message || "Failed to delete ingredient.");
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">
            Inventory Management
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage ingredients, stock levels, expiry dates and costs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800"
        >
          + Add Ingredient
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {editingItem ? "Edit Ingredient" : "Add Ingredient"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {editingItem
                  ? "Update the ingredient details in your restaurant inventory."
                  : "Add a new ingredient to your restaurant inventory."}
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

          <form
            onSubmit={editingItem ? handleEditIngredient : handleAddIngredient}
            className="space-y-5 px-6 py-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              {/* Ingredient Name */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Ingredient Name
                </label>

                <input
                  type="text"
                  value={formData.ingredientName}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      ingredientName: event.target.value,
                    })
                  }
                  placeholder="e.g. Tomato"
                  required
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.quantity}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      quantity: event.target.value,
                    })
                  }
                  placeholder="e.g. 5000"
                  required
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Base Unit
                </label>

                <select
                  value={formData.baseUnit}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      baseUnit: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                >
                  <option value="g">Gram (g)</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="piece">Piece</option>
                </select>
              </div>

              {/* Minimum Stock */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Minimum Stock
                </label>

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.minimumStock}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      minimumStock: event.target.value,
                    })
                  }
                  placeholder="e.g. 1000"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Expiry Date
                </label>

                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      expiryDate: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Cost */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Cost Per Unit
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      costPerUnit: event.target.value,
                    })
                  }
                  placeholder="e.g. 0.08"
                  required
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formLoading
                  ? editingItem
                    ? "Updating..."
                    : "Adding..."
                  : editingItem
                    ? "Update Ingredient"
                    : "Add Ingredient"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InventoryStatCard
          label="Total Ingredients"
          value={stats.totalIngredients}
          description="Items in inventory"
        />

        <InventoryStatCard
          label="Low Stock"
          value={stats.lowStock}
          description="Items need attention"
          accent="warning"
        />

        <InventoryStatCard
          label="Out of Stock"
          value={stats.outOfStock}
          description="Currently unavailable"
          accent="danger"
        />

        <InventoryStatCard
          label="Expiring Soon"
          value={stats.expiringSoon}
          description="Within next 7 days"
          accent="warning"
        />
      </div>

      {/* Inventory section placeholder */}
      {/* Inventory Table */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Inventory Items
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current ingredients and stock levels.
            </p>
          </div>

          <span className="text-xs font-medium text-slate-400">
            {inventory.length} item
            {inventory.length !== 1 ? "s" : ""}
          </span>
        </div>

        {inventory.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-900">
              No inventory items
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add your first ingredient to start managing inventory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Ingredient
                  </th>

                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Stock
                  </th>

                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Min. Stock
                  </th>

                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Expiry
                  </th>

                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Cost / Unit
                  </th>

                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => {
                  const status = getInventoryStatus(item);

                  return (
                    <tr
                      key={item._id}
                      className="transition-colors hover:bg-slate-50/60"
                    >
                      {/* Ingredient */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">
                          {item.ingredientName}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {item.baseUnit}
                        </p>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-slate-900">
                          {item.quantity}
                        </span>

                        <span className="ml-1 text-xs text-slate-400">
                          {item.baseUnit}
                        </span>
                      </td>

                      {/* Minimum Stock */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-slate-600">
                          {item.minimumStock}
                        </span>

                        <span className="ml-1 text-xs text-slate-400">
                          {item.baseUnit}
                        </span>
                      </td>

                      {/* Expiry */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {formatExpiryDate(item.expiryDate)}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-medium text-slate-700">
                          ₹{Number(item.costPerUnit || 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);

                              setFormData({
                                ingredientName: item.ingredientName || "",
                                quantity: item.quantity ?? "",
                                baseUnit: item.baseUnit || "g",
                                minimumStock: item.minimumStock ?? "",
                                expiryDate: item.expiryDate
                                  ? new Date(item.expiryDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : "",
                                costPerUnit: item.costPerUnit ?? "",
                              });

                              setShowForm(true);
                            }}
                            className="text-sm font-medium text-slate-600 hover:text-slate-900"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteIngredient(item._id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const getInventoryStatus = (item) => {
  if (item.quantity <= 0) {
    return {
      label: "Out of Stock",
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (item.quantity <= item.minimumStock) {
    return {
      label: "Low Stock",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Healthy",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
};

const formatExpiryDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const InventoryStatCard = ({ label, value, description, accent }) => {
  const accentClass =
    accent === "danger"
      ? "text-red-600"
      : accent === "warning"
        ? "text-amber-600"
        : "text-teal-700";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className={`mt-3 text-2xl font-semibold ${accentClass}`}>{value}</p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
};

export default Inventory;
