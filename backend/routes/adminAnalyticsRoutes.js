import express from "express";
import { adminProtect } from "../middleware/authMiddleware.js";
import { getEscrowSummary, getEscrowsForTable } from "../controllers/adminAnalyticsController.js";

const router = express.Router();
router.get("/escrow-summary", adminProtect, getEscrowSummary);
router.get("/escrows", adminProtect, getEscrowsForTable);

export default router;
