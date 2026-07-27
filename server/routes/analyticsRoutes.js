import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  orderDemandPrediction,
  inventoryRecommendationController,
  purchaseRecommendationController,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/order-demand", protect, orderDemandPrediction);

router.get(
  "/inventory-recommendation",
  protect,
  inventoryRecommendationController,
);

router.get(
  "/purchase-recommendation",
  protect,
  purchaseRecommendationController,
);

export default router;
