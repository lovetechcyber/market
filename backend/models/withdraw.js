import mongoose from "mongoose";

const walletWithdrawalSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  commission: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "processing", "success", "failed"], default: "pending" },
  recipient_code: String,
  transfer_code: String,
  metadata: Object,
}, { timestamps: true });

export default mongoose.model("WalletWithdrawal", walletWithdrawalSchema);
