import express from "express";
import { handlePaystackWebhook } from "../controllers/webhookController.js";
const router = express.Router();

router.post("/paystack", express.raw({ type: "application/json" }), handlePaystackWebhook);

export default router;
