import express from "express";
import { protect, adminProtect } from "../middleware/authMiddleware.js";
import { createOrGetRecipient, requestWithdrawal, processWithdrawal, verifyWithdrawal } from "../controllers/walletController.js";

const router = express.Router();

router.post("/recipient", protect, createOrGetRecipient);
router.post("/request", protect, requestWithdrawal);
// Admin endpoints
router.post("/process/:withdrawalId", adminProtect, processWithdrawal);
router.get("/verify/:withdrawalId", adminProtect, verifyWithdrawal);

export default router;
