import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  createWaste,
  executiveDashboard,
  getWasteHistory,
  wasteDashboard,
} from "../controllers/wasteController.js";

const router = express.Router();

router.post("/", protect, createWaste);

router.get("/", protect, getWasteHistory);

router.get("/dashboard", protect, wasteDashboard);

router.get("/executive-dashboard", protect, executiveDashboard);

export default router;
