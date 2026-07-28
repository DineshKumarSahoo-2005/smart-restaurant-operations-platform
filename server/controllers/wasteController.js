import Restaurant from "../models/Restaurant.js";

import Waste from "../models/Waste.js";
import {
  notifyManager
} from "../services/socketNotificationService.js";

import {
  getExecutiveDashboard,
  getWasteDashboard,
  recordWaste,
} from "../services/wasteService.js";

export const createWaste = async (req, res) => {
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

    const waste = await recordWaste(
      restaurant._id,
      req.user.id,
      req.body,
    );

    // 🔔 Notify Manager Dashboard
    notifyManager(
  restaurant._id,
  "dashboardUpdate",
  {
    type: "WASTE_RECORDED",
    wasteId: waste._id,
  }
);

    res.status(201).json({
      success: true,
      message: "Waste Recorded",
      waste,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWasteHistory = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user.id,
    });

    const waste = await Waste.find({
      restaurant: restaurant._id,
    })

      .populate("createdBy", "name email")

      .populate("inventoryItem", "ingredientName")

      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      count: waste.length,

      waste,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

export const wasteDashboard = async (req, res) => {
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

    const dashboard = await getWasteDashboard(restaurant._id);

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

export const executiveDashboard = async (req, res) => {
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

    const dashboard = await getExecutiveDashboard(restaurant._id);

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
