import express from "express";

import protect from "../middleware/authMiddleware.js";

import { createRecipe, getRecipe } from "../controllers/recipeController.js";

const router = express.Router();

router.post("/", protect, createRecipe);

router.get("/:menuId", protect, getRecipe);

export default router;
