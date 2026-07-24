import Inventory from "../models/Inventory.js";
import Restaurant from "../models/Restaurant.js";
import {
  getExpiringIngredients,
  getInventoryAnalytics,
  getInventoryDashboard,
  getLowStockIngredients,
} from "../services/inventoryService.js";

export const addIngredient = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const ingredient = await Inventory.create({
      restaurant: restaurant._id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      ingredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInventory = async (req, res) => {
  const restaurant = await Restaurant.findOne({
    owner: req.user.id,
  });

  const inventory = await Inventory.find({
    restaurant: restaurant._id,
  });

  res.json({
    success: true,
    inventory,
  });
};

export const updateInventory = async (req, res) => {
  const ingredient = await Inventory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    },
  );

  res.json({
    success: true,
    ingredient,
  });
};

export const deleteInventory = async (req, res) => {
  await Inventory.findByIdAndDelete(req.params.id);

  res.json({
    success: true,

    message: "Ingredient Deleted",
  });
};

// Inventory Dashboard

export const inventoryDashboard = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,

        message: "Restaurant not found",
      });
    }

    const dashboard = await getInventoryDashboard(restaurant._id);

    res.status(200).json({
      success: true,

      dashboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// Low Stock API

export const lowStockIngredients = async (
  req,

  res,
) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,

        message: "Restaurant not found",
      });
    }

    const ingredients = await getLowStockIngredients(restaurant._id);

    res.status(200).json({
      success: true,

      count: ingredients.length,

      ingredients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// Expiring Ingredients
export const expiringIngredients = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,

        message: "Restaurant not found",
      });
    }

    const ingredients = await getExpiringIngredients(restaurant._id);

    res.status(200).json({
      success: true,

      count: ingredients.length,

      ingredients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// Inventory Analytics
export const inventoryAnalytics = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,

        message: "Restaurant not found",
      });
    }

    const analytics = await getInventoryAnalytics(restaurant._id);

    res.status(200).json({
      success: true,

      analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
