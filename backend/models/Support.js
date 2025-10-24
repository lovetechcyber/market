import mongoose from "mongoose";

const supportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  status: { type: String, enum: ["open", "in_progress", "resolved"], default: "open" },
  responses: [
    {
      sender: { type: String }, // 'user' or 'admin'
      message: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

export default mongoose.model("Support", supportSchema);
