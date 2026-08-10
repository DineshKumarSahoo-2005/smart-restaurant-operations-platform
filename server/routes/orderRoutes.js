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
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant
 *               - items
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid order data
 *       401:
 *         description: Unauthorized
 */
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