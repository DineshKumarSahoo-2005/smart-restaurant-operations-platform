import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

// Create Order
router.post("/", protect, createOrder);

// Get All Orders
router.get("/", protect, getOrders);

// Get Single Order
router.get("/:id", protect, getOrderById);

// Update Status
router.put("/:id/status", protect, updateOrderStatus);

// Delete Order
router.delete("/:id", protect, deleteOrder);

export default router;