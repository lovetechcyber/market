import Chat from "../models/chat.js";
import Message from "../models/message.js";

// 🟢 Get all user chats (for chat sidebar)
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate("sender", "fullName email")
      .populate("receiver", "fullName email")
      .populate("product", "title _id")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error("Error fetching user chats:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Get messages for a product chat
export const getChatMessagesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const chat = await Chat.findOne({
      product: productId,
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate({
        path: "messages",
        populate: { path: "sender", select: "fullName" },
      })
      .populate("product", "title _id");

    if (!chat) return res.json({ messages: [] });

    res.json(chat);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text || !chatId)
      return res.status(400).json({ error: "Message text or chatId missing" });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const message = await Message.create({
      chatId,
      sender: req.user._id,
      text,
    });

    chat.messages.push(message._id);
    await chat.save();

    const populatedMessage = await message.populate("sender", "fullName");

    res.json(populatedMessage);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Server error" });
  }
};
