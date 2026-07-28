import Order from "../models/Order.js";
import { placeOrder } from "../services/orderService.js";
import {
  notifyKitchen,
  notifyManager,
} from "../services/socketNotificationService.js";

export const createOrder = async (req, res) => {
  try {
    const order = await placeOrder(req.user.id, req.body);

    // 🔔 Emit Socket Event
    notifyKitchen(
  order.restaurant,
  "newOrder",
  {
    orderId: order._id,
    status: order.status,
    order,
  }
);

notifyManager(
  order.restaurant,
  "dashboardUpdate",
  {
    type: "NEW_ORDER",
    orderId: order._id,
  }
);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("restaurant")
      .populate("items.menuItem")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("restaurant")
      .populate("items.menuItem");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "Pending",
      "Preparing",
      "Ready",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    order.status = status;

    await order.save();

    // 🔔 Notify all connected clients
    // Kitchen

    io.to(`kitchen-${order.restaurant}`).emit("orderStatusUpdated", {
      orderId: order._id,
      status: order.status,
      order,
    });

    io.to(`manager-${order.restaurant}`).emit("dashboardUpdate", {
      type: "ORDER_STATUS_UPDATED",
      orderId: order._id,
      status: order.status,
    });

    // Customer

    io.to(`customer-${order.user}`).emit("customerOrderUpdate", {
      orderId: order._id,
      status: order.status,
      estimatedTime: "20 Minutes",
    });

    res.status(200).json({
      success: true,
      message: "Status Updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
