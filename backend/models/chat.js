import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
