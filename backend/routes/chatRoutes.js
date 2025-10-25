import express from "express";
import Chat from "../models/chat.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  getUserChats,
  getChatMessagesByProduct,
  sendMessage
} from "../controllers/chatController.js";

const router = express.Router();

// 🟢 Start a chat with the seller from product page
router.post("/start/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate("seller");

    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.seller._id.toString() === req.user.id) {
      return res.status(400).json({ error: "You cannot chat with yourself" });
    }

    let chat = await Chat.findOne({
      product: productId,
      sender: req.user.id,
      receiver: product.seller._id
    });

    if (!chat) {
      chat = new Chat({
        product: productId,
        sender: req.user.id,
        receiver: product.seller._id,
        messages: []
      });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🟢 Send message within a chat
router.post("/:chatId/message", protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const newMsg = { text, sender: req.user.id };
    chat.messages.push(newMsg);
    await chat.save();

    res.json(newMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// 🟢 Get chat by product ID (for returning to conversation)
router.get("/product/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const chat = await Chat.findOne({ product: productId })
      .populate("messages.sender", "fullName");

    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🟢 Fetch all user chats
router.get("/", protect, getUserChats);

// 🟢 Fetch chat messages by product
router.get("/product/:productId/messages", protect, getChatMessagesByProduct);

// 🟢 Send message via controller (optional external handler)
router.post("/:chatId/send", protect, sendMessage);

export default router;
