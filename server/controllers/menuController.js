import Menu from "../models/Menu.js";
import Restaurant from "../models/Restaurant.js";

export const createMenuItem = async (req, res) => {
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

    const menu = await Menu.create({
      restaurant: restaurant._id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getMenu = async (req, res) => {
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

    const menu = await Menu.find({
      restaurant: restaurant._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: menu.length,
      menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateMenu = async (req, res) => {
  try {
    // Find the restaurant owned by the logged-in user
    const restaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Find menu item belonging to this restaurant
    const menu = await Menu.findOne({
      _id: req.params.id,
      restaurant: restaurant._id,
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Update menu item
    Object.assign(menu, req.body);

    await menu.save();

    res.json({
      success: true,
      menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteMenu = async (req, res) => {
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

    const menu = await Menu.findOne({
      _id: req.params.id,
      restaurant: restaurant._id,
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    await menu.deleteOne();

    res.json({
      success: true,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};