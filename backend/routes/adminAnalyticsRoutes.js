import express from "express";
import { adminOnly } from "../middleware/authMiddleware.js";
import { getescrowSummary, getescrowsForTable } from "../controllers/adminAnalyticsController.js";

const router = express.Router();
router.get("/escrow-summary", adminOnly, getescrowSummary);
router.get("/escrows", adminOnly, getescrowsForTable);

export default router;
