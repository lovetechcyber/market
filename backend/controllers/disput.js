import mongoose from "mongoose";
import Dispute from "../models/disput.js";
import Escrow from "../models/Escrow.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { refundCharge } from "../utils/paystack.js";
import { io } from "../utils/socket.js";

/**
 * @desc   Create a dispute (by user)
 * @route  POST /api/dispute
 * @access Private
 */
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

    io.emit("admin_notification", { message: "New dispute submitted", dispute });
    res.status(201).json({ success: true, dispute });
  } catch (err) {
    console.error("createDispute error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc   Resolve a dispute (admin)
 * @route  POST /api/dispute/resolve/:disputeId
 * @access Admin
 */
export const resolveDisputeRefund = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { disputeId } = req.params;
    const { action, note } = req.body; // 'refund' or 'reject'

    const dispute = await Dispute.findById(disputeId)
      .populate({ path: "escrow", populate: ["buyer", "seller"] })
      .session(session);

    if (!dispute) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Dispute not found" });
    }

    // Update dispute status
    dispute.status = action === "refund" ? "refunded" : "rejected";
    dispute.resolutionNote = note || "";
    dispute.resolvedAt = new Date();
    await dispute.save({ session });

    const escrow = dispute.escrow;

    if (action === "refund") {
      // Refund via Paystack
      const refundRes = await refundCharge(escrow.transactionId);

      // Update escrow and payment status
      escrow.status = "declined";
      await escrow.save({ session });

      await Payment.findOneAndUpdate(
        { transactionId: escrow.transactionId },
        { status: "refunded" },
        { session }
      );

      // Credit buyer wallet
      const buyer = await User.findById(escrow.buyer).session(session);
      buyer.walletBalance = (buyer.walletBalance || 0) + escrow.amount;
      await buyer.save({ session });

      await session.commitTransaction();
      session.endSession();

      // Notify buyer
      io.to(buyer._id.toString()).emit("refund_update", {
        message: "Refund processed successfully",
        dispute,
      });
      await sendEmail({
        to: buyer.email,
        subject: "Refund issued",
        text: `A refund of ₦${escrow.amount} has been issued for your order ${escrow._id}.`,
      });

      return res.json({ message: "Refund processed successfully", refundRes, dispute });
    }

    // Action: reject
    await session.commitTransaction();
    session.endSession();

    await sendEmail({
      to: dispute.raisedBy.email,
      subject: "Dispute Rejected",
      text: note || "Your dispute has been reviewed and rejected.",
    });

    io.to(dispute.raisedBy._id.toString()).emit("dispute_update", {
      message: "Dispute rejected",
      dispute,
    });

    res.json({ message: "Dispute rejected successfully", dispute });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("resolveDisputeRefund error:", err);
    res.status(500).json({ message: err.message });
  }
};
