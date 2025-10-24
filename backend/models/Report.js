
// models/Report.js
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  url: String,
  type: { type: String, enum: ["image", "video"] },
});

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    sellerUsername: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String },
    media: [mediaSchema],
    isPaymentRelated: { type: Boolean, default: false },

    // 🔹 new fields for payment dispute
    isPaymentRelated: { type: Boolean, default: false },
    escrowId: { type: mongoose.Schema.Types.ObjectId, ref: "Escrow", default: null },

    status: {
      type: String,
      enum: ["pending", "under_review", "resolved", "declined"],
      default: "pending",
    },
    adminComment: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);

