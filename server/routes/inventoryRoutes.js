import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  addIngredient,
  getInventory,
  updateInventory,
  deleteInventory,
  inventoryDashboard,
  lowStockIngredients,
  expiringIngredients,
  inventoryAnalytics,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.post("/", protect, addIngredient);

router.get("/", protect, getInventory);

router.get("/dashboard", protect, inventoryDashboard);

router.get(
  "/low-stock",

  protect,

  lowStockIngredients,
);

router.get(
  "/expiring",

  protect,

  expiringIngredients,
);

router.get("/analytics", protect, inventoryAnalytics);

router.put("/:id", protect, updateInventory);

router.delete("/:id", protect, deleteInventory);

export default router;
