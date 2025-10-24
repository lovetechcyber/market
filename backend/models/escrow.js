import mongoose from "mongoose";

const escrowSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  amount: { type: Number, required: true },
  commissionRate: { type: Number, default: 5 }, // global default %
  categoryCommission: { type: Number },
  status: {
    type: String,
    enum: ["pending", "in_escrow", "released", "approved", "declined"],
    default: "pending",
  },
  transactionId: { type: String },
  createdAt: { type: Date, default: Date.now },
  payoutAmount: { type: Number, default: 0 },
  releasedAt: Date,
});

export default mongoose.model("Escrow", escrowSchema);


