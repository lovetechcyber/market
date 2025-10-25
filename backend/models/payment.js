import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    amount: Number,
    commission: Number,
    reference: String,
    status: {
      type: String,
      enum: ["pending", "paid", "in_escrow", "released", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;

