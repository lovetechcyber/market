import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { createDispute, resolveDisputeRefund } from "../controllers/disput.js";

const router = express.Router();

router.post("/create", protect, createDispute);
router.put("/resolve/:disputeId", adminOnly, resolveDisputeRefund);

export default router;
