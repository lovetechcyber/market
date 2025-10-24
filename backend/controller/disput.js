import Dispute from "../models/disput.js";
import Escrow from "../models/escrow.js";
import Payment from "../models/payment.js";
import sendEmail from "../utils/sendEmail.js";
import { refundCharge } from "../utils/paystack.js";
import { io } from "../utils/socket.js";

export const createDispute = async (req, res) => {
  try {
    const { escrowId, reason, evidence } = req.body;
    const dispute = await Dispute.create({
      escrow: escrowId,
      raisedBy: req.user._id,
      reason,
      evidence,
      status: "open",
    });

    // notify admin
    io.emit("admin_notification", { message: "New dispute", dispute });
    res.status(201).json({ dispute });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin resolves and issues refund
export const resolveDisputeRefund = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { action, note } = req.body; // action: 'refund' or 'reject'
    const dispute = await Dispute.findById(disputeId).populate({ path: "escrow", populate: ["buyer","seller"] });
    if (!dispute) return res.status(404).json({ message: "Dispute not found" });

    dispute.status = action === "refund" ? "refunded" : "rejected";
    dispute.resolutionNote = note;
    dispute.resolvedAt = new Date();

    if (action === "refund") {
      // perform refund via Paystack using the original transaction ID (escrow.transactionId)
      const escrow = dispute.escrow;
      // call refund endpoint
      try {
        const refundRes = await refundCharge(escrow.transactionId);
        // mark escrow declined/refunded
        escrow.status = "declined";
        await escrow.save();

        // Update any Payment entries too (if Payment model used)
        await Payment.findOneAndUpdate({ transactionId: escrow.transactionId }, { status: "refunded" });

        // return funds to buyer wallet if you maintain buyer wallet
        const buyer = escrow.buyer;
        // optional: credit buyer.walletBalance += escrow.amount

        await sendEmail({ to: buyer.email, subject: "Refund processed", text: `A refund for your order ${escrow._id} was processed.` });
        io.to(buyer._id.toString()).emit("refund_update", { message: "Refund processed", dispute, refundRes });
      } catch (err) {
        console.error("Refund error:", err);
        return res.status(500).json({ message: "Refund failed", error: err.message });
      }
    } else {
      // rejected: notify buyer and seller
      await sendEmail({ to: dispute.raisedBy.email, subject: "Dispute rejected", text: note || "Your dispute was rejected." });
      io.to(dispute.raisedBy._id.toString()).emit("dispute_update", { message: "Dispute rejected", dispute });
    }

    await dispute.save();
    res.json({ message: "Dispute resolved", dispute });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


import mongoose from "mongoose";
import Dispute from "../models/Dispute.js";
import Escrow from "../models/Escrow.js";
import WalletWithdrawal from "../models/WalletWithdrawal.js";
import Payment from "../models/Payment.js";
import sendEmail from "../utils/sendEmail.js";
import { refundCharge } from "../utils/paystack.js";
import { io } from "../utils/socket.js";

export const resolveDisputeRefund = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { disputeId } = req.params;
    const { action, note } = req.body;
    const dispute = await Dispute.findById(disputeId).populate({ path: "escrow", populate: ["buyer","seller"] }).session(session);
    if (!dispute) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ message: "Dispute not found" });
    }

    dispute.status = action === "refund" ? "refunded" : "rejected";
    dispute.resolutionNote = note;
    dispute.resolvedAt = new Date();
    await dispute.save({ session });

    if (action === "refund") {
      const escrow = dispute.escrow;
      // call Paystack refund (external)
      const refundRes = await refundCharge(escrow.transactionId);

      // update escrow & payment records in transaction
      escrow.status = "declined";
      await escrow.save({ session });

      await Payment.findOneAndUpdate({ transactionId: escrow.transactionId }, { status: "refunded" }, { session });

      // Optionally credit buyer wallet (if you maintain wallet system)
      const buyer = await User.findById(escrow.buyer).session(session);
      buyer.walletBalance = (buyer.walletBalance || 0) + escrow.amount;
      await buyer.save({ session });

      await session.commitTransaction();
      session.endSession();

      // notify after commit
      io.to(buyer._id.toString()).emit("refund_update", { message: "Refund processed", dispute });
      await sendEmail({ to: buyer.email, subject: "Refund issued", text: `A refund of ₦${escrow.amount} was processed.` });

      res.json({ message: "Refund processed", refundRes, dispute });
    } else {
      await session.commitTransaction();
      session.endSession();

      await sendEmail({ to: dispute.raisedBy.email, subject: "Dispute rejected", text: note || "Your dispute was rejected." });
      io.to(dispute.raisedBy._id.toString()).emit("dispute_update", { message: "Dispute rejected", dispute });

      res.json({ message: "Dispute rejected", dispute });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("resolveDisputeRefund error:", err);
    res.status(500).json({ message: err.message });
  }
};
