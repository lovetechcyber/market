import express from "express";
import { createTicket, getUserTickets, getAllTickets, respondTicket } from "../controllers/supportController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createTicket);
router.get("/my-tickets", protect, getUserTickets);
router.get("/all", protect, adminOnly, getAllTickets);
router.put("/respond/:id", protect, adminOnly, respondTicket);

export default router;
