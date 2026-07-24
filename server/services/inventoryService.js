import Inventory from "../models/Inventory.js";

export const checkStock = async (ingredients, orderedQuantity) => {
  for (const ingredient of ingredients) {
    const inventory = await Inventory.findById(ingredient.inventoryItem);

    if (!inventory) {
      throw new Error(`${ingredient.inventoryItem} not found`);
    }

    const requiredQuantity = ingredient.quantity * orderedQuantity;

    if (inventory.quantity < requiredQuantity) {
      throw new Error(`Insufficient stock for ${inventory.ingredientName}`);
    }
  }

  return true;
};

export const convertToBaseUnit = (quantity, unit) => {
  switch (unit) {
    case "kg":
      return quantity * 1000;

    case "g":
      return quantity;

    case "litre":
      return quantity * 1000;

    case "ml":
      return quantity;

    case "piece":
      return quantity;

    default:
      throw new Error("Unsupported Unit");
  }
};

export const deductInventory = async (
  ingredients,
  orderedQuantity,
  session,
) => {
  for (const ingredient of ingredients) {
    const inventory = await Inventory.findById(
      ingredient.inventoryItem,
    ).session(session);

    const requiredQuantity = ingredient.quantity * orderedQuantity;

    inventory.quantity -= requiredQuantity;

    await inventory.save({ session });
  }
};

export const checkLowStock = async (restaurantId) => {
  const inventory = await Inventory.find({
    restaurant: restaurantId,
  });

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.minimumStock,
  );

  return lowStockItems;
};

// Dashboard Statistics

export const getInventoryDashboard = async (restaurantId) => {
  const totalIngredients = await Inventory.countDocuments({
    restaurant: restaurantId,
  });

  const lowStock = await Inventory.countDocuments({
    restaurant: restaurantId,
    $expr: {
      $lte: ["$quantity", "$minimumStock"],
    },
  });

  const outOfStock = await Inventory.countDocuments({
    restaurant: restaurantId,
    quantity: 0,
  });

  const today = new Date();

  const nextSevenDays = new Date();

  nextSevenDays.setDate(today.getDate() + 7);

  const expiringSoon = await Inventory.countDocuments({
    restaurant: restaurantId,

    expiryDate: {
      $gte: today,
      $lte: nextSevenDays,
    },
  });

  return {
    totalIngredients,

    lowStock,

    outOfStock,

    expiringSoon,
  };
};

// Low Stock Ingredients

export const getLowStockIngredients = async (restaurantId) => {
  const ingredients = await Inventory.find({
    restaurant: restaurantId,

    $expr: {
      $lte: ["$quantity", "$minimumStock"],
    },
  })

    .select("ingredientName quantity minimumStock baseUnit expiryDate")

    .sort({
      quantity: 1,
    });

  return ingredients;
};

// Expiring Soon Ingredients
export const getExpiringIngredients = async (restaurantId) => {
  const today = new Date();

  const nextSevenDays = new Date();

  nextSevenDays.setDate(today.getDate() + 7);

  const ingredients = await Inventory.find({
    restaurant: restaurantId,

    expiryDate: {
      $gte: today,

      $lte: nextSevenDays,
    },
  })

    .select("ingredientName quantity baseUnit expiryDate")

    .sort({
      expiryDate: 1,
    });

  return ingredients;
};

// Inventory Analytics
export const getInventoryAnalytics = async (restaurantId) => {
  const totalIngredients = await Inventory.countDocuments({
    restaurant: restaurantId,
  });

  const lowStock = await Inventory.countDocuments({
    restaurant: restaurantId,
    $expr: {
      $lte: ["$quantity", "$minimumStock"],
    },
  });

  const outOfStock = await Inventory.countDocuments({
    restaurant: restaurantId,
    quantity: 0,
  });

  const today = new Date();

  const nextSevenDays = new Date();

  nextSevenDays.setDate(today.getDate() + 7);

  const expiringSoon = await Inventory.countDocuments({
    restaurant: restaurantId,

    expiryDate: {
      $gte: today,

      $lte: nextSevenDays,
    },
  });

  const highestStock = await Inventory.findOne({
    restaurant: restaurantId,
  })
    .sort({
      quantity: -1,
    })
    .select("ingredientName quantity baseUnit");

  const lowestStock = await Inventory.findOne({
    restaurant: restaurantId,
  })
    .sort({
      quantity: 1,
    })
    .select("ingredientName quantity baseUnit");

  return {
    totalIngredients,

    healthyIngredients: totalIngredients - lowStock - outOfStock,

    lowStock,

    outOfStock,

    expiringSoon,

    highestStock,

    lowestStock,
  };
};
