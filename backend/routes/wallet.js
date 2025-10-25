import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { createOrGetRecipient, requestWithdrawal, processWithdrawal, verifyWithdrawal } from "../controllers/walletController.js";

const router = express.Router();

router.post("/recipient", protect, createOrGetRecipient);
router.post("/request", protect, requestWithdrawal);
// Admin endpoints
router.post("/process/:withdrawalId", adminOnly, processWithdrawal);
router.get("/verify/:withdrawalId", adminOnly, verifyWithdrawal);

export default router;
