import mongoose from "mongoose";

const ticketSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["open", "closed"], default: "open" }
}, { timestamps: true });

export default mongoose.model("Ticket", ticketSchema);
