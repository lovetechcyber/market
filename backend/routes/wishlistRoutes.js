// routes/wishlistRoutes.js
const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Add to wishlist
router.post("/add/:productId", async (req, res) => {
  try {
    const userId = req.user.id; // assume JWT middleware sets req.user
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
    }
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove from wishlist
router.delete("/remove/:productId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get wishlist
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("wishlist");
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
