import Chat from "../models/chat.js";
import Message from "../models/message.js";

// Get all user chats (for sidebar)
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate("participants", "fullName email")
      .populate("product", "name _id")
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get messages for product chat
export const getChatMessagesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const chat = await Chat.findOne({
      product: productId,
      participants: req.user._id,
    })
      .populate({
        path: "messages",
        populate: { path: "sender", select: "fullName" },
      })
      .populate("product", "name _id");

    if (!chat) return res.json({ messages: [] });

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Send new message
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    const message = await Message.create({
      chatId,
      sender: req.user._id,
      text,
    });

    const chat = await Chat.findById(chatId);
    chat.messages.push(message._id);
    await chat.save();

    const populatedMessage = await message.populate("sender", "fullName");

    res.json(populatedMessage);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
