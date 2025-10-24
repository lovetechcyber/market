import express from "express";
import Message from "../models/message.js";

const router = express.Router();

// Fetch chat messages by chatId
router.get("/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark messages as read
router.patch("/:chatId/read", async (req, res) => {
  try {
    await Message.updateMany({ chatId: req.params.chatId }, { $set: { read: true } });
    res.json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
