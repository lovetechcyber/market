import express from "express";
import User from "../models/User.js";
const router = express.Router();

// Add to cart
router.post("/add/:productId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    const item = user.cart.find((c) => c.productId.toString() === productId);

    if (item) {
      item.quantity += 1;
    } else {
      user.cart.push({ productId, quantity: 1 });
    }
    await user.save();
    res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove from cart
router.delete("/remove/:productId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    user.cart = user.cart.filter(
      (c) => c.productId.toString() !== productId
    );
    await user.save();
    res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update quantity
router.put("/update/:productId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const user = await User.findById(userId);
    const item = user.cart.find((c) => c.productId.toString() === productId);

    if (item) {
      item.quantity = quantity;
    }
    await user.save();
    res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cart
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("cart.productId");
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

