import express from "express";
import { protect, adminProtect } from "../middleware/authMiddleware.js";
import { createDispute, resolveDisputeRefund } from "../controllers/disput.js";

const router = express.Router();

router.post("/create", protect, createDispute);
router.put("/resolve/:disputeId", adminProtect, resolveDisputeRefund);

export default router;
