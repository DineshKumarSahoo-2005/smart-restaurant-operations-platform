import Restaurant from "../models/Restaurant.js";

export const createRestaurant = async (req, res) => {
  try {
    const { name, description, cuisine, address, phone } = req.body;

    if (!name || !cuisine || !address || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const existingRestaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "Owner already has a restaurant",
      });
    }

    const restaurant = await Restaurant.create({
      name,
      description,
      cuisine,
      address,
      phone,
      owner: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getMyRestaurant = async (req, res) => {
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

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};