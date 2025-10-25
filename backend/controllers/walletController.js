import mongoose from "mongoose";
import User from "../models/User.js";
import WalletWithdrawal from "../models/withdrawal.js";
import { createTransferRecipient, initiateTransfer, verifyTransfer } from "../utils/paystack.js";
import { io } from "../utils/socket.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * Create or Get Paystack Recipient
 * Saves the Paystack recipient_code to user's profile
 */
export const createOrGetRecipient = async (req, res) => {
  try {
    const { account_number, bank_code, name } = req.body;

    const payRes = await createTransferRecipient({ name, account_number, bank_code });
    const recipient = payRes.data;

    const user = await User.findById(req.user._id);
    user.paystackRecipient = recipient.recipient_code;
    await user.save();

    res.json({ recipient });
  } catch (err) {
    console.error("createOrGetRecipient error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Seller requests a withdrawal
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { amount } = req.body;

    const seller = await User.findById(sellerId);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    if ((seller.walletBalance || 0) < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    const withdrawal = await WalletWithdrawal.create({
      seller: sellerId,
      amount,
      status: "pending",
      recipient_code: seller.paystackRecipient,
    });

    // Deduct immediately from wallet as "reserved"
    seller.walletBalance -= amount;
    seller.reservedBalance = (seller.reservedBalance || 0) + amount;
    await seller.save();

    // Notify admin
    io.emit("admin_notification", {
      message: `New withdrawal request: ${withdrawal._id}`,
      withdrawal,
    });

    res.status(201).json({ message: "Withdrawal requested", withdrawal });
  } catch (err) {
    console.error("requestWithdrawal error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Admin processes a pending withdrawal (initiates Paystack transfer)
 */
export const processWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { withdrawalId } = req.params;

    const withdrawal = await WalletWithdrawal.findById(withdrawalId)
      .populate("seller")
      .session(session);

    if (!withdrawal) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Withdrawal is not pending" });
    }

    // Initiate Paystack transfer
    const transferRes = await initiateTransfer({
      amount: withdrawal.amount,
      recipient: withdrawal.recipient_code,
      reason: `Seller payout ${withdrawal._id}`,
    });

    withdrawal.status = "processing";
    withdrawal.transfer_code = transferRes.data.transfer_code || transferRes.data.id;
    withdrawal.metadata = transferRes;
    await withdrawal.save({ session });

    await session.commitTransaction();
    session.endSession();

    io.emit("admin_notification", {
      message: `Processing withdrawal ${withdrawal._id}`,
      withdrawal,
    });

    await sendEmail({
      to: withdrawal.seller.email,
      subject: "Withdrawal Processing",
      text: `Your withdrawal of ₦${withdrawal.amount} is currently being processed.`,
    });

    res.json({ message: "Withdrawal processing started", withdrawal });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("processWithdrawal error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Verify withdrawal status via Paystack
 */
export const verifyWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await WalletWithdrawal.findById(withdrawalId).populate("seller");
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });

    const payRes = await verifyTransfer(withdrawal.transfer_code);
    const status = payRes.data.status; // success | failed | pending

    const seller = withdrawal.seller;

    if (status === "success") {
      withdrawal.status = "success";
      seller.reservedBalance -= withdrawal.amount;

      await seller.save();
      io.to(seller._id.toString()).emit("withdrawal_update", {
        message: "Withdrawal successful",
        withdrawal,
      });

      await sendEmail({
        to: seller.email,
        subject: "Withdrawal Completed",
        text: `Your withdrawal of ₦${withdrawal.amount} was successful.`,
      });

    } else if (status === "failed") {
      withdrawal.status = "failed";
      seller.reservedBalance -= withdrawal.amount;
      seller.walletBalance += withdrawal.amount;

      await seller.save();
      io.to(seller._id.toString()).emit("withdrawal_update", {
        message: "Withdrawal failed. Funds returned to wallet",
        withdrawal,
      });

      await sendEmail({
        to: seller.email,
        subject: "Withdrawal Failed",
        text: `Your withdrawal of ₦${withdrawal.amount} failed and funds have been returned to your wallet.`,
      });
    }

    await withdrawal.save();
    res.json({ message: "Verification complete", withdrawal, payRes });
  } catch (err) {
    console.error("verifyWithdrawal error:", err);
    res.status(500).json({ message: err.message });
  }
};
