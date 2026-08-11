import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  createMenuItem,
  getMenu,
  updateMenu,
  deleteMenu,
} from "../controllers/menuController.js";
import validate from "../middleware/validate.js";

import { menuSchema } from "../validators/menuValidator.js";

const router = express.Router();

router.post("/", protect, validate(menuSchema), createMenuItem);

router.get("/", protect, getMenu);

router.put("/:id", protect, validate(menuSchema), updateMenu);

router.delete("/:id", protect, deleteMenu);

export default router;
