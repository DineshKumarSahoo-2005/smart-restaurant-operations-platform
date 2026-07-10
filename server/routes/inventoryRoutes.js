import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  addIngredient,
  getInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.post("/", protect, addIngredient);

router.get("/", protect, getInventory);

router.put("/:id", protect, updateInventory);

router.delete("/:id", protect, deleteInventory);

export default router;
