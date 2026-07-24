import mongoose from "mongoose";

import Restaurant from "../models/Restaurant.js";
import Menu from "../models/Menu.js";
import Recipe from "../models/Recipe.js";
import Order from "../models/Order.js";

import {
  checkStock,
  deductInventory,
} from "./inventoryService.js";

export const placeOrder = async (ownerId, orderData) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    // Find Restaurant
    const restaurant = await Restaurant.findOne({
      owner: ownerId,
    });

    if (!restaurant) {
      throw new Error("Restaurant not found.");
    }

    let totalAmount = 0;

    const orderItems = [];

    // Process every menu item
    for (const item of orderData.items) {
      // Find Menu Item
      const menu = await Menu.findOne({
        _id: item.menuItem,
        restaurant: restaurant._id,
      });

      if (!menu) {
        throw new Error("Menu Item not found.");
      }

      // Check Availability
      if (!menu.isAvailable) {
        throw new Error(
          `${menu.name} is currently unavailable.`,
        );
      }

      // Find Recipe
      const recipe = await Recipe.findOne({
        menuItem: menu._id,
      }).populate("ingredients.inventoryItem");

      if (!recipe) {
        throw new Error(
          `Recipe not found for ${menu.name}`
        );
      }

      // Validate Stock
      await checkStock(
        recipe.ingredients,
        item.quantity
      );

      // Deduct Inventory
      await deductInventory(
        recipe.ingredients,
        item.quantity,
        session
      );

      // Calculate Price
      const itemTotal =
        menu.price * item.quantity;

      totalAmount += itemTotal;

      orderItems.push({
        menuItem: menu._id,
        quantity: item.quantity,
        price: menu.price,
      });
    }
        // Create Order
    const createdOrder = await Order.create(
      [
        {
          restaurant: restaurant._id,
          items: orderItems,
          totalAmount,
          status: "Pending",
        },
      ],
      { session }
    );

    // Commit Transaction
    await session.commitTransaction();

    session.endSession();

    return createdOrder[0];

  } catch (error) {

    // Rollback Everything
    await session.abortTransaction();

    session.endSession();

    throw error;

  }

};