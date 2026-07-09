import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  createRestaurant,
  getMyRestaurant,
} from "../controllers/restaurantController.js";

const router = express.Router();

router.post("/", protect, createRestaurant);

router.get("/me", protect, getMyRestaurant);

export default router;