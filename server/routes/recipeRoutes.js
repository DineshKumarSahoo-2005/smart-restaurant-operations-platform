import express from "express";
import validate from "../middleware/validate.js";
import { recipeSchema } from "../validators/recipeValidator.js";

import protect from "../middleware/authMiddleware.js";

import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  getRecipes,
  updateRecipe,
} from "../controllers/recipeController.js";

const router = express.Router();

router.post("/", protect, validate(recipeSchema), createRecipe);

router.get("/", protect, getRecipes);

router.get("/:menuId", protect, getRecipe);

router.put("/:id", protect, validate(recipeSchema), updateRecipe);

router.delete("/:id", protect, deleteRecipe);

export default router;
