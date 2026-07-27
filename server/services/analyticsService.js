import Order from "../models/Order.js";
import Recipe from "../models/Recipe.js";
import Inventory from "../models/Inventory.js";
import Menu from "../models/Menu.js";

export const predictTomorrowOrders = async (restaurantId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const orders = await Order.find({
    restaurant: restaurantId,
    createdAt: {
      $gte: sevenDaysAgo,
    },
  });

  const totalOrders = orders.length;

  const averageDailyOrders = Number((totalOrders / 7).toFixed(2));

  // Simple prediction
  // Add 10% growth factor

  const predictedTomorrowOrders = Math.ceil(averageDailyOrders * 1.1);

  return {
    totalOrders,
    averageDailyOrders,
    predictedTomorrowOrders,
  };
};

export const inventoryRecommendation = async (restaurantId) => {
  const prediction = await predictTomorrowOrders(restaurantId);
  const predictedOrders = prediction.predictedTomorrowOrders;
  const menu = await Menu.findOne({
    restaurant: restaurantId,
  });

  if (!menu) {
    throw new Error("Menu not found");
  }

  const recipe = await Recipe.findOne({
    menuItem: menu._id,
  }).populate("ingredients.inventoryItem");

  if (!recipe) {
    throw new Error("Recipe not found");
  }

  const recommendations = [];

  for (const item of recipe.ingredients) {
    if (!item.inventoryItem) {
      throw new Error("Recipe contains an invalid inventory reference.");
    }

    const inventory = item.inventoryItem;

    const required = item.quantity * predictedOrders;

    recommendations.push({
      ingredient: inventory.ingredientName,
      required,
      available: inventory.quantity,
      baseUnit: inventory.baseUnit,
      status:
        inventory.quantity >= required ? "Enough Stock" : "Reorder Needed",
    });
  }

  return {
    predictedOrders,
    ingredients: recommendations,
  };
};

// Purchase Recommendation
export const purchaseRecommendation = async (restaurantId) => {
  const recommendation = await inventoryRecommendation(restaurantId);
  const shoppingList = [];
  let totalEstimatedCost = 0;

  for (const item of recommendation.ingredients) {
    if (item.available < item.required) {
      const inventory = await Inventory.findOne({
        restaurant: restaurantId,
        ingredientName: item.ingredient,
      });

      const buy = item.required - item.available;
      const estimatedCost = buy * inventory.costPerUnit;
      totalEstimatedCost += estimatedCost;
      shoppingList.push({
        ingredient: item.ingredient,
        available: item.available,
        required: item.required,
        buy,
        baseUnit: item.baseUnit,
        estimatedCost,
      });
    }
  }

  return {
    shoppingList,
    totalEstimatedCost,
  };
};
