import Restaurant from "../models/Restaurant.js";

import {
  inventoryRecommendation,
  predictTomorrowOrders,
  purchaseRecommendation,
} from "../services/analyticsService.js";

export const orderDemandPrediction = async (req, res) => {
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

    const prediction = await predictTomorrowOrders(restaurant._id);
    res.status(200).json({
      success: true,
      prediction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const inventoryRecommendationController = async (req, res) => {
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

    const recommendation = await inventoryRecommendation(restaurant._id);

    res.status(200).json({
      success: true,
      recommendation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const purchaseRecommendationController = async (req,res) => {
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

    const shopping = await purchaseRecommendation(restaurant._id);
    res.status(200).json({
      success: true,
      shopping,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
