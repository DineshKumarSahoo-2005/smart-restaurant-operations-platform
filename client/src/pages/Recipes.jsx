import { useEffect, useState } from "react";
import api from "../services/api";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState("");

  const [recipeIngredients, setRecipeIngredients] = useState([
    {
      inventoryItem: "",
      quantity: "",
      baseUnit: "g",
    },
  ]);

  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [menuResponse, inventoryResponse, recipesResponse] =
        await Promise.all([
          api.get("/menu"),
          api.get("/inventory"),
          api.get("/recipes"),
        ]);

      setMenuItems(menuResponse.data.menu || []);
      setInventory(inventoryResponse.data.inventory || []);
      setRecipes(recipesResponse.data.recipes || []);
    } catch (error) {
      console.error("Failed to load recipe data:", error);

      setError(error.response?.data?.message || "Failed to load recipe data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading recipes...</p>
      </div>
    );
  }

  const handleCreateRecipe = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        menuItem: selectedMenuItem,
        ingredients: recipeIngredients.map((ingredient) => ({
          inventoryItem: ingredient.inventoryItem,
          quantity: Number(ingredient.quantity),
          baseUnit: ingredient.baseUnit,
        })),
      };

      await api.post("/recipes", payload);

      setShowForm(false);

      await loadData();

      setError("");
    } catch (error) {
      console.error("Failed to create recipe:", error);

      setError(error.response?.data?.message || "Failed to create recipe.");
    }
  };

  const handleUpdateRecipe = async (e) => {
    e.preventDefault();

    if (!editingRecipe) return;

    try {
      setSaving(true);
      setError("");

      const payload = {
        menuItem: selectedMenuItem,
        ingredients: recipeIngredients.map((ingredient) => ({
          inventoryItem: ingredient.inventoryItem,
          quantity: Number(ingredient.quantity),
          baseUnit: ingredient.baseUnit,
        })),
      };

      await api.put(`/recipes/${editingRecipe._id}`, payload);

      setEditingRecipe(null);
      setSelectedMenuItem("");

      setRecipeIngredients([
        {
          inventoryItem: "",
          quantity: "",
          baseUnit: "g",
        },
      ]);

      await loadData();
    } catch (error) {
      console.error("Failed to update recipe:", error);

      setError(error.response?.data?.message || "Failed to update recipe.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recipeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this recipe?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/recipes/${recipeId}`);

      setRecipes((currentRecipes) =>
        currentRecipes.filter((recipe) => recipe._id !== recipeId),
      );
    } catch (error) {
      console.error("Failed to delete recipe:", error);

      setError(error.response?.data?.message || "Failed to delete recipe.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Recipe Management</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Recipes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage ingredient composition for your menu items.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800"
        >
          + Add Recipe
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Menu Items
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {menuItems.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Inventory Items
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {inventory.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Recipes
          </p>

          <p className="mt-2 text-2xl font-semibold text-teal-700">
            {recipes.length}
          </p>
        </div>
      </div>

      {editingRecipe && (
        <section className="rounded-xl border border-slate-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Edit Recipe
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Update the ingredients required for this menu item.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingRecipe(null);
                setSelectedMenuItem("");
                setRecipeIngredients([
                  {
                    inventoryItem: "",
                    quantity: "",
                    baseUnit: "g",
                  },
                ]);
              }}
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleUpdateRecipe} className="space-y-6 px-6 py-6">
            {/* Menu Item */}
            <div>
              <label className="text-sm font-medium text-slate-700">
                Menu Item
              </label>

              <select
                value={selectedMenuItem}
                onChange={(e) => setSelectedMenuItem(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              >
                <option value="">Select a menu item</option>

                {menuItems.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Ingredients
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Update the inventory items required to prepare this dish.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRecipeIngredients([
                      ...recipeIngredients,
                      {
                        inventoryItem: "",
                        quantity: "",
                        baseUnit: "g",
                      },
                    ])
                  }
                  className="text-sm font-medium text-teal-700 hover:text-teal-800"
                >
                  + Add ingredient
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {recipeIngredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="grid gap-3 md:grid-cols-[1fr_160px_140px_auto]"
                  >
                    {/* Inventory Item */}
                    <select
                      value={ingredient.inventoryItem}
                      onChange={(e) => {
                        const updated = [...recipeIngredients];

                        updated[index].inventoryItem = e.target.value;

                        setRecipeIngredients(updated);
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    >
                      <option value="">Select ingredient</option>

                      {inventory.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.ingredientName}
                        </option>
                      ))}
                    </select>

                    {/* Quantity */}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Quantity"
                      value={ingredient.quantity}
                      onChange={(e) => {
                        const updated = [...recipeIngredients];

                        updated[index].quantity = e.target.value;

                        setRecipeIngredients(updated);
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    />

                    {/* Unit */}
                    <select
                      value={ingredient.baseUnit}
                      onChange={(e) => {
                        const updated = [...recipeIngredients];

                        updated[index].baseUnit = e.target.value;

                        setRecipeIngredients(updated);
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="piece">piece</option>
                    </select>

                    {/* Remove */}
                    {recipeIngredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setRecipeIngredients(
                            recipeIngredients.filter((_, i) => i !== index),
                          );
                        }}
                        className="px-2 text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() => {
                  setEditingRecipe(null);
                  setSelectedMenuItem("");

                  setRecipeIngredients([
                    {
                      inventoryItem: "",
                      quantity: "",
                      baseUnit: "g",
                    },
                  ]);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Updating..." : "Update Recipe"}
              </button>
            </div>
          </form>
        </section>
      )}

      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Create Recipe
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Define the ingredients required for a menu item.
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

          <form onSubmit={handleCreateRecipe} className="space-y-6 px-6 py-6">
            {/* Menu Item */}
            <div>
              <label className="text-sm font-medium text-slate-700">
                Menu Item
              </label>

              <select
                value={selectedMenuItem}
                onChange={(e) => setSelectedMenuItem(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              >
                <option value="">Select a menu item</option>

                {menuItems.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Ingredients
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Add the inventory items required to prepare this dish.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRecipeIngredients([
                      ...recipeIngredients,
                      {
                        inventoryItem: "",
                        quantity: "",
                        baseUnit: "g",
                      },
                    ])
                  }
                  className="text-sm font-medium text-teal-700 hover:text-teal-800"
                >
                  + Add ingredient
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {recipeIngredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="grid gap-3 md:grid-cols-[1fr_160px_140px_auto]"
                  >
                    {/* Inventory Item */}
                    <select
                      value={ingredient.inventoryItem}
                      onChange={(e) => {
                        const updated = [...recipeIngredients];

                        updated[index].inventoryItem = e.target.value;

                        setRecipeIngredients(updated);
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    >
                      <option value="">Select ingredient</option>

                      {inventory.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.ingredientName}
                        </option>
                      ))}
                    </select>

                    {/* Quantity */}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Quantity"
                      value={ingredient.quantity}
                      onChange={(e) => {
                        const updated = [...recipeIngredients];

                        updated[index].quantity = e.target.value;

                        setRecipeIngredients(updated);
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    />

                    {/* Unit */}
                    <select
                      value={ingredient.baseUnit}
                      onChange={(e) => {
                        const updated = [...recipeIngredients];

                        updated[index].baseUnit = e.target.value;

                        setRecipeIngredients(updated);
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="piece">piece</option>
                    </select>

                    {/* Remove */}
                    {recipeIngredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setRecipeIngredients(
                            recipeIngredients.filter((_, i) => i !== index),
                          );
                        }}
                        className="px-2 text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
              >
                {saving ? "Creating..." : "Create Recipe"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Recipe List */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-semibold text-slate-900">Menu Recipes</h2>

          <p className="mt-1 text-xs text-slate-500">
            Configure ingredients for each menu item.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {recipes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-900">
                No recipes yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Create a recipe for one of your menu items to get started.
              </p>
            </div>
          ) : (
            recipes.map((recipe) => (
              <div key={recipe._id} className="px-6 py-6">
                {/* Recipe Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {recipe.menuItem?.name || "Unknown Menu Item"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {recipe.menuItem?.category || "Uncategorized"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRecipe(recipe);

                        setSelectedMenuItem(
                          recipe.menuItem?._id || recipe.menuItem,
                        );

                        setRecipeIngredients(
                          recipe.ingredients?.map((ingredient) => ({
                            inventoryItem:
                              ingredient.inventoryItem?._id ||
                              ingredient.inventoryItem,
                            quantity: ingredient.quantity,
                            baseUnit: ingredient.baseUnit,
                          })) || [],
                        );
                      }}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(recipe._id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>

                    <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                      {recipe.ingredients?.length || 0} ingredients
                    </span>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="mt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Ingredients
                  </p>

                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    {recipe.ingredients?.map((ingredient, index) => (
                      <div
                        key={ingredient._id || index}
                        className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {ingredient.inventoryItem?.ingredientName ||
                              "Unknown Ingredient"}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Inventory item
                          </p>
                        </div>

                        <p className="text-sm font-semibold text-slate-700">
                          {ingredient.quantity} {ingredient.baseUnit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Recipes;
