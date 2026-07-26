import mongoose from "mongoose";

import Inventory from "../models/Inventory.js";

import Waste from "../models/Waste.js";

export const recordWaste = async (
  restaurantId,

  userId,

  wasteData,
) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const inventory = await Inventory.findOne({
      _id: wasteData.inventoryItem,

      restaurant: restaurantId,
    }).session(session);

    if (!inventory) {
      throw new Error("Inventory Not Found");
    }

    if (inventory.quantity < wasteData.quantity) {
      throw new Error("Insufficient Inventory");
    }

    inventory.quantity -= wasteData.quantity;

    await inventory.save({ session });

    const costLoss = wasteData.quantity * inventory.costPerUnit;

    const waste = await Waste.create(
      [
        {
          restaurant: restaurantId,

          inventoryItem: inventory._id,

          ingredientName: inventory.ingredientName,

          quantity: wasteData.quantity,

          baseUnit: inventory.baseUnit,

          reason: wasteData.reason,

          costLoss,

          createdBy: userId,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    session.endSession();

    return waste[0];
  } catch (error) {
    await session.abortTransaction();

    session.endSession();

    throw error;
  }
};

// Waste Dashboard Analytics
export const getWasteDashboard = async (restaurantId) => {
  const waste = await Waste.find({
    restaurant: restaurantId,
  });

  const totalWasteEvents = waste.length;

  const totalQuantityWasted = waste.reduce(
    (sum, item) => sum + item.quantity,

    0,
  );

  const totalCostLoss = waste.reduce(
    (sum, item) => sum + item.costLoss,

    0,
  );

  let ingredientMap = {};

  let reasonMap = {};

  waste.forEach((item) => {
    ingredientMap[item.ingredientName] =
      (ingredientMap[item.ingredientName] || 0) + item.quantity;

    reasonMap[item.reason] = (reasonMap[item.reason] || 0) + 1;
  });

  const mostWastedIngredient =
    Object.keys(ingredientMap).reduce(
      (a, b) => (ingredientMap[a] > ingredientMap[b] ? a : b),

      Object.keys(ingredientMap)[0],
    ) || null;

  const mostCommonReason =
    Object.keys(reasonMap).reduce(
      (a, b) => (reasonMap[a] > reasonMap[b] ? a : b),

      Object.keys(reasonMap)[0],
    ) || null;

  return {
    totalWasteEvents,

    totalQuantityWasted,

    totalCostLoss,

    mostWastedIngredient,

    mostCommonReason,
  };
};

// Executive Dashboard
export const getExecutiveDashboard = async (restaurantId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const week = new Date();
  week.setDate(week.getDate() - 7);

  const month = new Date();
  month.setMonth(month.getMonth() - 1);

  const todayWaste = await Waste.find({
    restaurant: restaurantId,
    createdAt: { $gte: today },
  });

  const weekWaste = await Waste.find({
    restaurant: restaurantId,
    createdAt: { $gte: week },
  });

  const monthWaste = await Waste.find({
    restaurant: restaurantId,
    createdAt: { $gte: month },
  });

  const topIngredients = await Waste.aggregate([
    {
      $match: {
        restaurant: restaurantId,
      },
    },
    {
      $group: {
        _id: "$ingredientName",
        quantity: {
          $sum: "$quantity",
        },
      },
    },
    {
      $sort: {
        quantity: -1,
      },
    },
    {
      $limit: 5,
    },
  ]);

  return {
    today: {
      events: todayWaste.length,

      costLoss: todayWaste.reduce(
        (sum, item) => sum + item.costLoss,

        0,
      ),
    },

    thisWeek: {
      events: weekWaste.length,

      costLoss: weekWaste.reduce(
        (sum, item) => sum + item.costLoss,

        0,
      ),
    },

    thisMonth: {
      events: monthWaste.length,

      costLoss: monthWaste.reduce(
        (sum, item) => sum + item.costLoss,

        0,
      ),
    },

    topIngredients,
  };
};
