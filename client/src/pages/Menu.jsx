import { useEffect, useState } from "react";
import api from "../services/api";

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    isAvailable: true,
  });

  const [error, setError] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Fetch menu
  const loadMenu = async () => {
    try {
      const response = await api.get("/menu");

      setMenuItems(response.data.menu || []);
    } catch (error) {
      console.error("Failed to load menu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add menu item
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
      };

      // EDIT
      if (editingItem) {
        const response = await api.put(`/menu/${editingItem._id}`, payload);

        setMenuItems((previous) =>
          previous.map((item) =>
            item._id === editingItem._id ? response.data.menu : item,
          ),
        );

        setEditingItem(null);
      }

      // ADD
      else {
        const response = await api.post("/menu", payload);

        setMenuItems((previous) => [...previous, response.data.menu]);
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        isAvailable: true,
      });

      setShowForm(false);
    } catch (error) {
      console.error("Menu operation failed:", error);

      setError(error.response?.data?.message || "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading menu...</p>
      </div>
    );
  }

  const handleEdit = (item) => {
    setEditingItem(item);

    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category,
      price: item.price,
      isAvailable: item.isAvailable,
    });

    setError("");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(id);

      await api.delete(`/menu/${id}`);

      setMenuItems((previous) => previous.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Failed to delete menu item:", error);

      setError(error.response?.data?.message || "Failed to delete menu item.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const response = await api.put(`/menu/${item._id}`, {
        name: item.name,
        description: item.description || "",
        category: item.category,
        price: Number(item.price),
        image: item.image || "",
        isAvailable: !item.isAvailable,
      });

      setMenuItems((previous) =>
        previous.map((menuItem) =>
          menuItem._id === item._id ? response.data.menu : menuItem,
        ),
      );
    } catch (error) {
      console.error("Failed to update availability:", error);

      setError(
        error.response?.data?.message || "Failed to update availability.",
      );
    }
  };

  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category).filter(Boolean)),
  ];

  const filteredItems = menuItems.filter((item) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      item.name.toLowerCase().includes(searchText) ||
      item.description?.toLowerCase().includes(searchText);

    const matchesCategory = category === "All" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Menu Management</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Menu
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage dishes, pricing and availability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          <span className="text-lg">+</span>
          Add menu item
        </button>
      </div>

      {/* Add Menu Form */}
      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-900">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingItem
                ? "Update your menu item details."
                : "Add a new dish to your restaurant menu."}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Chicken Biryani"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the dish..."
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* Category + Price */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Main Course"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 250"
                  min="1"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            {/* Availability */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 accent-teal-700"
              />

              <span className="text-sm font-medium text-slate-700">
                Available for customers
              </span>
            </label>

            {/* Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  setError("");

                  setFormData({
                    name: "",
                    description: "",
                    category: "",
                    price: "",
                    isAvailable: true,
                  });
                }}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                {editingItem ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        >
          {categories.map((itemCategory) => (
            <option key={itemCategory} value={itemCategory}>
              {itemCategory === "All" ? "All categories" : itemCategory}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items */}
      <section className="rounded-xl border border-slate-200 bg-white">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Menu Items</h2>

            <p className="mt-1 text-xs text-slate-500">
              All dishes available in your restaurant.
            </p>
          </div>

          <span className="text-xs text-slate-400">
            {menuItems.length} {menuItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Items */}
        {filteredItems.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-slate-900">
                {menuItems.length === 0
                  ? "No menu items yet"
                  : "No matching menu items"}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {menuItems.length === 0
                  ? "Add your first dish to start building your restaurant menu."
                  : "Try a different search or category."}
              </p>

              {menuItems.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setError("");

                    setFormData({
                      name: "",
                      description: "",
                      category: "",
                      price: "",
                      isAvailable: true,
                    });

                    setShowForm(true);
                  }}
                  className="mt-6 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  + &nbsp; Add menu item
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-6 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              + &nbsp; Add menu item
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-6 px-6 py-5"
              >
                {/* Left */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {item.name}
                    </h3>

                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {item.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item)}
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium transition ${
                        item.isAvailable
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.description || "No description available."}
                  </p>
                </div>

                {/* Price */}
                {/* Right side */}
                <div className="flex shrink-0 items-center gap-5">
                  {/* Price */}
                  <p className="text-sm font-semibold text-slate-900">
                    ₹{item.price}
                  </p>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="text-sm font-medium text-teal-700 hover:text-teal-900"
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    disabled={deleteLoading === item._id}
                    className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    {deleteLoading === item._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Menu;
