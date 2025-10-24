import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema({
  escrow: { type: mongoose.Schema.Types.ObjectId, ref: "Escrow", required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String },
  evidence: [String], // urls to images/files
  status: { type: String, enum: ["open","reviewing","resolved","refunded","rejected"], default: "open" },
  resolutionNote: String,
  resolvedAt: Date,
}, { timestamps: true });

export default mongoose.model("Dispute", disputeSchema);
