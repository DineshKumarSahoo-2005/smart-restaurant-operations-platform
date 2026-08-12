import Recipe from "../models/Recipe.js";
import Menu from "../models/Menu.js";
import Inventory from "../models/Inventory.js";
import Restaurant from "../models/Restaurant.js";

export const createRecipe = async (req, res) => {
  try {
    const { menuItem, ingredients } = req.body;

    // Basic validation
    if (!menuItem) {
      return res.status(400).json({
        success: false,
        message: "Menu item is required",
      });
    }

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one ingredient is required",
      });
    }

    // Find restaurant owned by logged-in user
    const restaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Check menu item belongs to this restaurant
    const menu = await Menu.findOne({
      _id: menuItem,
      restaurant: restaurant._id,
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found in your restaurant",
      });
    }

    // Get inventory items belonging to this restaurant
    const inventoryIds = ingredients.map(
      (ingredient) => ingredient.inventoryItem,
    );

    const inventoryItems = await Inventory.find({
      _id: { $in: inventoryIds },
      restaurant: restaurant._id,
    });

    // Make sure every ingredient belongs to this restaurant
    if (inventoryItems.length !== inventoryIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more inventory items do not belong to your restaurant",
      });
    }

    // Check if recipe already exists
    const existingRecipe = await Recipe.findOne({
      menuItem,
    });

    if (existingRecipe) {
      return res.status(400).json({
        success: false,
        message: "Recipe already exists for this menu item",
      });
    }

    // Validate ingredient structure
    for (const ingredient of ingredients) {
      if (
        !ingredient.inventoryItem ||
        !ingredient.quantity ||
        !ingredient.baseUnit
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each ingredient must have inventoryItem, quantity and baseUnit",
        });
      }

      if (ingredient.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Ingredient quantity must be greater than 0",
        });
      }
    }

    // Create recipe
    const recipe = await Recipe.create({
      menuItem,
      ingredients,
    });

    // Populate response
    await recipe.populate("menuItem");
    await recipe.populate("ingredients.inventoryItem");

    res.status(201).json({
      success: true,
      recipe,
    });
  } catch (error) {
    console.error("Create recipe error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecipe = async (req, res) => {
  try {
    // Find restaurant owned by logged-in user
    const restaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Verify menu item belongs to restaurant
    const menu = await Menu.findOne({
      _id: req.params.menuId,
      restaurant: restaurant._id,
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Find recipe
    const recipe = await Recipe.findOne({
      menuItem: menu._id,
    })
      .populate("menuItem")
      .populate("ingredients.inventoryItem");

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecipes = async (req, res) => {
  try {
    // Find restaurant owned by logged-in user
    const restaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Get all menu items belonging to restaurant
    const menuItems = await Menu.find({
      restaurant: restaurant._id,
    }).select("_id");

    const menuItemIds = menuItems.map((menuItem) => menuItem._id);

    // Get recipes for those menu items
    const recipes = await Recipe.find({
      menuItem: { $in: menuItemIds },
    })
      .populate("menuItem")
      .populate("ingredients.inventoryItem")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const { ingredients } = req.body;

    // Find restaurant owned by logged-in user
    const restaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Find recipe
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Verify recipe's menu item belongs to this restaurant
    const menu = await Menu.findOne({
      _id: recipe.menuItem,
      restaurant: restaurant._id,
    });

    if (!menu) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this recipe",
      });
    }

    // Verify inventory ownership
    const inventoryIds = ingredients.map(
      (ingredient) => ingredient.inventoryItem,
    );

    const inventoryItems = await Inventory.find({
      _id: { $in: inventoryIds },
      restaurant: restaurant._id,
    });

    if (inventoryItems.length !== inventoryIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more inventory items are invalid",
      });
    }

    // Update ingredients
    recipe.ingredients = ingredients;

    await recipe.save();

    // Return populated recipe
    const updatedRecipe = await Recipe.findById(recipe._id)
      .populate("menuItem")
      .populate("ingredients.inventoryItem");

    res.status(200).json({
      success: true,
      message: "Recipe updated successfully",
      recipe: updatedRecipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    // Find restaurant owned by logged-in user
    const restaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Find recipe
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Verify recipe belongs to this restaurant
    const menu = await Menu.findOne({
      _id: recipe.menuItem,
      restaurant: restaurant._id,
    });

    if (!menu) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this recipe",
      });
    }

    await recipe.deleteOne();

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
