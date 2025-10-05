import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  status: { type: String, enum: ["pending", "in_escrow", "completed"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
