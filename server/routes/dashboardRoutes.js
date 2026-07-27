import express from "express";

import protect from "../middleware/authMiddleware.js";

import { managerDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.get(
  "/manager",
  protect,
  managerDashboard,
);

export default router;
