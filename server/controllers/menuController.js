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

    const menu = await Menu.find({
      restaurant: restaurant._id,
    });

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


export const updateMenu = async (req, res) => {
  const menu = await Menu.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json({
    success: true,
    menu,
  });
};

export const deleteMenu = async (req, res) => {
  await Menu.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Menu Deleted",
  });
};