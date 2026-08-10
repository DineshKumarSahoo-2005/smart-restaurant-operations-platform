import Order from "../models/Order.js";
import { placeOrder } from "../services/orderService.js";
import {
  notifyKitchen,
  notifyManager,
} from "../services/socketNotificationService.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const order = await placeOrder(req.user.id, req.body);

  // 🔔 Notify Kitchen
  notifyKitchen(order.restaurant, "newOrder", {
    orderId: order._id,
    status: order.status,
    order,
  });

  // 🔔 Notify Manager Dashboard
  notifyManager(order.restaurant, "dashboardUpdate", {
    type: "NEW_ORDER",
    orderId: order._id,
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order,
  });
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("restaurant")
    .populate("items.menuItem")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("restaurant")
    .populate("items.menuItem");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.status(200).json({
    success: true,
    order,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const allowedStatus = [
    "Pending",
    "Preparing",
    "Ready",
    "Completed",
    "Cancelled",
  ];

  if (!allowedStatus.includes(status)) {
    res.status(400);
    throw new Error("Invalid Status");
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order Not Found");
  }

  order.status = status;

  await order.save();

  // 🔔 Notify Kitchen
  notifyKitchen(order.restaurant, "orderStatusUpdated", {
    orderId: order._id,
    status: order.status,
    order,
  });

  // 🔔 Notify Manager Dashboard
  notifyManager(order.restaurant, "dashboardUpdate", {
    type: "ORDER_STATUS_UPDATED",
    orderId: order._id,
    status: order.status,
  });

  res.status(200).json({
    success: true,
    message: "Status Updated",
    order,
  });
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order Not Found");
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order Deleted Successfully",
  });
});