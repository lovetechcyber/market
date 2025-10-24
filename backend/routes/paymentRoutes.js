import express from "express";
import {
  initiatePayment,
  verifyEscrowPayment,
  releasePayment,
  getSellerPayouts,
} from "../controller/payment.js";
import { protect } from "../middleware/authMiddleware.js";
import { handlePaystackWebhook } from "../controllers/webhook.js";

const router = express.Router();

// ⚠️ Webhook should not require authentication
router.post("/webhook", express.raw({ type: "application/json" }), handlePaystackWebhook);

router.post("/initiate", protect, initiatePayment);
router.get("/verify/:reference", protect, verifyEscrowPayment);
router.post("/release", protect, releasePayment);
router.get("/seller-payouts", protect, getSellerPayouts);
// Buyer confirms delivery to release funds
router.post("/confirm-delivery/:escrowId", protect, buyerConfirmDelivery);

export default router;
