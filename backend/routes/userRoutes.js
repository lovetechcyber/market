import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route GET /api/user/dashboard
 * @desc Get user dashboard stats
 * @access Private
 */
router.get("/dashboard", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Count total items posted by the user
    const itemsPosted = await Product.countDocuments({ seller: userId });

    // Count items tagged as 'Sold'
    const sold = await Product.countDocuments({ seller: userId, tag: "Sold" });

    // Get user's balance
    const user = await User.findById(userId).select("balance");

    res.json({
      itemsPosted,
      sold,
      balance: user?.balance || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
});

export default router;
