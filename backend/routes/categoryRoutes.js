import express from "express";
import { createCategory, getCategories } from "../controllers/categoryController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin creates categories
router.post("/", protect, adminOnly, createCategory);

// Public fetch
router.get("/", getCategories);

export default router;
