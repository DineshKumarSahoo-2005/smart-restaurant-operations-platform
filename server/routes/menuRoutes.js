import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  createMenuItem,
  getMenu,
  updateMenu,
  deleteMenu,
} from "../controllers/menuController.js";

const router = express.Router();

router.post("/", protect, createMenuItem);

router.get("/", protect, getMenu);

router.put("/:id", protect, updateMenu);

router.delete("/:id", protect, deleteMenu);

export default router;