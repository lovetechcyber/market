import express from "express";
import Chat from "../models/chat.js";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/auth.js";
import { getUserChats, getChatMessagesByProduct, sendMessage } from "../controllers/chatController.js";


const router = express.Router();

// Start chat with seller from product page
router.post("/start/:productId", verifyToken, async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId).populate("seller");

  if (!product) return res.status(404).json({ error: "Product not found" });
  if (product.seller._id.toString() === req.user.id) {
    return res.status(400).json({ error: "You cannot chat yourself" });
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
});

// Send message
router.post("/:chatId/message", verifyToken, async (req, res) => {
  const { chatId } = req.params;
  const { text } = req.body;

  let chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  const newMsg = { text, sender: req.user.id };
  chat.messages.push(newMsg);
  await chat.save();

  res.json(newMsg); // return the single message
});


// Get chat by product (so user can return via product ID)
router.get("/product/:productId", verifyToken, async (req, res) => {
  const { productId } = req.params;
  const chat = await Chat.findOne({ product: productId }).populate("messages.sender", "fullName");
  res.json(chat);
});



router.get("/", authMiddleware, getUserChats);
router.get("/product/:productId", authMiddleware, getChatMessagesByProduct);
router.post("/:chatId/message", authMiddleware, sendMessage);


export default router;
