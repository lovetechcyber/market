import express from "express";
import {
  initiateEscrowPayment,
  verifyEscrowPayment,
  getSellerPayouts,
  buyerConfirmDelivery,
} from "../controllers/payment.js"; // ✅ Unified import path
import { protect } from "../middleware/authMiddleware.js";
import { handlePaystackWebhook } from "../controllers/webhook.js"; // ✅ fixed plural “controllers” typo

const router = express.Router();

/**
 * ✅ PAYMENTS ROUTES
 * Includes escrow, verification, payout, and buyer confirmation.
 */

// ⚠️ Webhook must bypass auth — used by Paystack server
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handlePaystackWebhook
);

// 💳 Initiate payment (escrow creation)
router.post("/initiate", protect, initiateEscrowPayment);

// 🔍 Verify Paystack transaction
router.get("/verify/:reference", protect, verifyEscrowPayment);

// 💰 Buyer manually confirms delivery → funds released to seller
router.post("/confirm-delivery/:escrowId", protect, buyerConfirmDelivery);

// 🧾 Admin or system-triggered escrow release (optional manual override)


// 💸 Seller can view payout records / wallet transactions
router.get("/seller-payouts", protect, getSellerPayouts);

export default router;
