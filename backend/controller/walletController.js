import User from "../models/User.js";
import WalletWithdrawal from "../models/WalletWithdrawal.js";
import { createTransferRecipient, initiateTransfer, verifyTransfer } from "../utils/paystack.js";
import { io } from "../utils/socket.js";
import sendEmail from "../utils/sendEmail.js";

export const createOrGetRecipient = async (req, res) => {
  try {
    const { account_number, bank_code, name } = req.body;
    // Create recipient on Paystack
    const payRes = await createTransferRecipient({ name, account_number, bank_code });
    const recipient = payRes.data;
    // Save recipient code to user's profile for reuse
    const user = await User.findById(req.user._id);
    user.paystackRecipient = recipient.recipient_code;
    await user.save();
    res.json({ recipient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

    // Deduct immediately from wallet as reserved
    seller.walletBalance = (seller.walletBalance || 0) - amount;
    seller.reservedBalance = (seller.reservedBalance || 0) + amount;
    await seller.save();

    // Notify admin via socket/email if you have admin room, example:
    io.emit("admin_notification", { message: `New withdrawal request: ${withdrawal._id}`, withdrawal });

    res.status(201).json({ message: "Withdrawal requested", withdrawal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const processWithdrawal = async (req, res) => {
  try {
    // Admin endpoint - processes a pending withdrawal by calling Paystack
    const { withdrawalId } = req.params;
    const withdrawal = await WalletWithdrawal.findById(withdrawalId).populate("seller");
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });
    if (withdrawal.status !== "pending") return res.status(400).json({ message: "Withdrawal not pending" });

    // Initiate transfer
    const transferRes = await initiateTransfer({
      amount: withdrawal.amount,
      recipient: withdrawal.recipient_code,
      reason: `Seller payout ${withdrawal._id}`,
    });

    withdrawal.status = "processing";
    withdrawal.transfer_code = transferRes.data.transfer_code || transferRes.data.id;
    withdrawal.metadata = transferRes;
    await withdrawal.save();

    // Optionally, immediately verify (or handle webhook)
    res.json({ message: "Withdrawal processing started", withdrawal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const withdrawal = await WalletWithdrawal.findById(withdrawalId).populate("seller");
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });

    const payRes = await verifyTransfer(withdrawal.transfer_code);
    const status = payRes.data.status; // "success", "failed", etc

    if (status === "success") {
      withdrawal.status = "success";
      // mark reservedBalance down
      const seller = withdrawal.seller;
      seller.reservedBalance = (seller.reservedBalance || 0) - withdrawal.amount;
      await seller.save();

      // send notification
      io.to(seller._id.toString()).emit("withdrawal_update", { message: "Withdrawal successful", withdrawal });
      await sendEmail({ to: seller.email, subject: "Withdrawal completed", text: `Your withdrawal of ${withdrawal.amount} was successful.` });
    } else if (status === "failed") {
      withdrawal.status = "failed";
      // return reserved funds to wallet
      const seller = withdrawal.seller;
      seller.reservedBalance = (seller.reservedBalance || 0) - withdrawal.amount;
      seller.walletBalance = (seller.walletBalance || 0) + withdrawal.amount;
      await seller.save();

      io.to(seller._id.toString()).emit("withdrawal_update", { message: "Withdrawal failed. Funds returned to wallet", withdrawal });
      await sendEmail({ to: seller.email, subject: "Withdrawal failed", text: `Your withdrawal of ${withdrawal.amount} failed and funds were returned to your wallet.` });
    }

    await withdrawal.save();
    res.json({ message: "Verified", withdrawal, payRes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


import mongoose from "mongoose";
import WalletWithdrawal from "../models/WalletWithdrawal.js";
import User from "../models/User.js";
import { initiateTransfer } from "../utils/paystack.js";
import sendEmail from "../utils/sendEmail.js";
import { io } from "../utils/socket.js";

export const processWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { withdrawalId } = req.params;
    const withdrawal = await WalletWithdrawal.findById(withdrawalId).populate("seller").session(session);
    if (!withdrawal) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    if (withdrawal.status !== "pending") {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: "Not pending" });
    }

    // Initiate transfer via Paystack
    const transferRes = await initiateTransfer({
      amount: withdrawal.amount,
      recipient: withdrawal.recipient_code,
      reason: `Seller payout ${withdrawal._id}`
    });

    // Save transfer meta atomically
    withdrawal.status = "processing";
    withdrawal.transfer_code = transferRes.data.transfer_code || transferRes.data.id;
    withdrawal.metadata = transferRes;
    await withdrawal.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Notify
    io.emit("admin_notification", { message: `Processing withdrawal ${withdrawal._id}`, withdrawal });
    await sendEmail({ to: withdrawal.seller.email, subject: "Withdrawal processing", text: `Your withdrawal is processing.` });

    res.json({ message: "Processing started", withdrawal });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("processWithdrawal error:", err);
    res.status(500).json({ message: err.message });
  }
};
