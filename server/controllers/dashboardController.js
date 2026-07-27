import Restaurant from "../models/Restaurant.js";

import { getInventoryDashboard } from "../services/inventoryService.js";

import {
  predictTomorrowOrders,
  purchaseRecommendation,
} from "../services/analyticsService.js";

import { getWasteDashboard } from "../services/wasteService.js";

export const managerDashboard = async (req, res) => {
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

    const inventory = await getInventoryDashboard(restaurant._id);
    const orders = await predictTomorrowOrders(restaurant._id);
    const purchase = await purchaseRecommendation(restaurant._id);
    const waste = await getWasteDashboard(restaurant._id);
    res.status(200).json({
      success: true,
      dashboard: {
        inventory,
        orders,
        purchase,
        waste,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
