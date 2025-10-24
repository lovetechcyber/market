import express from "express";
import { createEscrow, releaseEscrow } from "../controller/escrow.js";
const router = express.Router();

router.post("/create", createEscrow);
router.put("/release/:escrowId", releaseEscrow);

export default router;
