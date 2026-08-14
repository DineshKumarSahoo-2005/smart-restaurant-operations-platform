import { useEffect, useState } from "react";
import api from "../services/api";

const ORDER_STATUSES = [
  "Pending",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [orderForm, setOrderForm] = useState({
    menuItem: "",
    quantity: 1,
  });

  const [creatingOrder, setCreatingOrder] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending",
  ).length;

  const preparingOrders = orders.filter(
    (order) => order.status === "Preparing",
  ).length;

  const readyOrders = orders.filter((order) => order.status === "Ready").length;

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const [ordersResponse, menuResponse] = await Promise.all([
        api.get("/orders"),
        api.get("/menu"),
      ]);

      setOrders(ordersResponse.data.orders || []);
      setMenuItems(menuResponse.data.menu || []);
    } catch (error) {
      console.error("Failed to load orders:", error);

      setError(error.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading orders...</p>
      </div>
    );
  }

  const handleCreateOrder = async () => {
    try {
      setCreatingOrder(true);
      setError("");

      await api.post("/orders", {
        items: [
          {
            menuItem: orderForm.menuItem,
            quantity: orderForm.quantity,
          },
        ],
      });

      setOrderForm({
        menuItem: "",
        quantity: 1,
      });

      setShowCreateForm(false);

      await loadOrders();
    } catch (error) {
      console.error("Failed to create order:", error);

      setError(error.response?.data?.message || "Failed to create order.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      const response = await api.put(`/orders/${orderId}/status`, {
        status,
      });

      const updatedOrder = response.data.order;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                ...updatedOrder,
              }
            : order,
        ),
      );

      setSelectedOrder((currentOrder) =>
        currentOrder?._id === orderId
          ? {
              ...currentOrder,
              ...updatedOrder,
            }
          : currentOrder,
      );
    } catch (error) {
      console.error("Failed to update order status:", error);

      setError(
        error.response?.data?.message || "Failed to update order status.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      setDeletingOrderId(orderId);
      setError("");

      await api.delete(`/orders/${orderId}`);

      setOrders((currentOrders) =>
        currentOrders.filter((order) => order._id !== orderId),
      );

      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to delete order:", error);

      setError(error.response?.data?.message || "Failed to delete order.");
    } finally {
      setDeletingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Order Management</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage restaurant orders and track their status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800"
        >
          + Create Order
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showCreateForm && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Create Order
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Select a menu item and quantity to place an order.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-5 px-6 py-6">
            {/* Menu Item */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Menu Item
              </label>

              <select
                value={orderForm.menuItem}
                onChange={(event) =>
                  setOrderForm({
                    ...orderForm,
                    menuItem: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              >
                <option value="">Select a menu item</option>

                {menuItems
                  .filter((item) => item.isAvailable)
                  .map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} — ₹{item.price}
                    </option>
                  ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={orderForm.quantity}
                onChange={(event) =>
                  setOrderForm({
                    ...orderForm,
                    quantity: Number(event.target.value),
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  creatingOrder || !orderForm.menuItem || orderForm.quantity < 1
                }
                onClick={handleCreateOrder}
                className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingOrder ? "Creating..." : "Create Order"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Orders Table */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Orders</h2>

            <p className="mt-1 text-xs text-slate-500">
              Current restaurant orders.
            </p>
          </div>

          <span className="text-xs text-slate-400">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No orders yet</p>

            <p className="mt-1 text-sm text-slate-500">
              Orders will appear here once they are placed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Order
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Items
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Total
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Created
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    {/* Order */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {order.items?.length || 0}{" "}
                        {order.items?.length === 1 ? "item" : "items"}
                      </p>
                    </td>

                    {/* Items */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items?.map((item, index) => (
                          <p
                            key={item._id || index}
                            className="text-sm text-slate-700"
                          >
                            {item.menuItem?.name || "Unknown Item"}{" "}
                            <span className="text-slate-400">
                              × {item.quantity}
                            </span>
                          </p>
                        ))}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        ₹{order.totalAmount}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />

                        <select
                          value={order.status}
                          disabled={updatingOrderId === order._id}
                          onChange={(event) =>
                            handleUpdateStatus(order._id, event.target.value)
                          }
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none transition focus:border-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="text-sm font-medium text-teal-700 transition hover:text-teal-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Order Statistics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OrderStatCard
          label="Total Orders"
          value={totalOrders}
          description="All restaurant orders"
        />

        <OrderStatCard
          label="Pending"
          value={pendingOrders}
          description="Waiting to be prepared"
          accent="warning"
        />

        <OrderStatCard
          label="Preparing"
          value={preparingOrders}
          description="Currently being prepared"
        />

        <OrderStatCard
          label="Ready"
          value={readyOrders}
          description="Ready for completion"
          accent="success"
        />
      </div>
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Order Details
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  #{selectedOrder._id.slice(-6).toUpperCase()}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-sm font-medium text-slate-400 transition hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            {/* Order Information */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Status</p>

                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={selectedOrder.status} />

                  <select
                    value={selectedOrder.status}
                    disabled={updatingOrderId === selectedOrder._id}
                    onChange={(event) =>
                      handleUpdateStatus(selectedOrder._id, event.target.value)
                    }
                    className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 outline-none transition focus:border-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Order Items
                </p>

                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="flex items-center justify-between border-b border-slate-100 px-4 py-4 last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {item.menuItem?.name || "Unknown Item"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-slate-900">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
                <p className="text-sm font-medium text-slate-600">
                  Total Amount
                </p>

                <p className="text-lg font-semibold text-slate-900">
                  ₹{selectedOrder.totalAmount}
                </p>
              </div>

              {/* Created At */}
              <div className="mt-4">
                <p className="text-xs text-slate-400">Created</p>

                <p className="mt-1 text-sm text-slate-700">
                  {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                disabled={deletingOrderId === selectedOrder._id}
                onClick={() => {
                  const confirmed = window.confirm(
                    `Are you sure you want to delete order #${selectedOrder._id
                      .slice(-6)
                      .toUpperCase()}? This action cannot be undone.`,
                  );

                  if (confirmed) {
                    handleDeleteOrder(selectedOrder._id);
                  }
                }}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingOrderId === selectedOrder._id
                  ? "Deleting..."
                  : "Delete Order"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const OrderStatCard = ({ label, value, description, accent }) => {
  const accentClass =
    accent === "warning"
      ? "text-amber-600"
      : accent === "success"
        ? "text-emerald-600"
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

const OrderStatusBadge = ({ status }) => {
  const styles = {
    Pending: "border-amber-200 bg-amber-50 text-amber-700",

    Preparing: "border-blue-200 bg-blue-50 text-blue-700",

    Ready: "border-teal-200 bg-teal-50 text-teal-700",

    Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",

    Cancelled: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
};

export default Orders;
