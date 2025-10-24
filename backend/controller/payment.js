import Payment from "../models/payment.js";
import Order from "../models/Order.js";
import Commission from "../models/Commission.js";
import { initiateEscrowPayment, verifyPayment } from "../utils/paystack.js";
import { v4 as uuidv4 } from "uuid";

// Initiate Payment
export const initiatePayment = async (req, res) => {
  try {
    const { productId, amount } = req.body;
    const buyerId = req.user.id;
    const product = await Order.findById(productId).populate("sellerId");

    if (!product) return res.status(404).json({ message: "Product not found" });

    const reference = uuidv4();

    const payment = await Payment.create({
      buyerId,
      sellerId: product.sellerId,
      productId,
      amount,
      reference,
      status: "pending",
    });

    const paystackResponse = await initiateEscrowPayment(
      req.user.email,
      amount,
      reference,
      { buyerId, productId, type: "escrow" }
    );

    res.json({ paymentUrl: paystackResponse.data.authorization_url });
  } catch (error) {
    console.error("Payment initiation failed:", error);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};

// Verify Payment
export const verifyEscrowPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const verification = await verifyPayment(reference);
    const status = verification.data.status;

    if (status === "success") {
      const payment = await Payment.findOneAndUpdate(
        { reference },
        { status: "in_escrow" },
        { new: true }
      );
      res.json({ message: "Payment held in escrow", payment });
    } else {
      res.status(400).json({ message: "Payment not successful" });
    }
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// Release Escrow (after buyer confirmation)
export const releasePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const payment = await Payment.findOne({ productId: orderId, status: "in_escrow" });
    if (!payment) return res.status(404).json({ message: "No escrow payment found" });

    const commissionConfig = await Commission.findOne();
    const commissionRate =
      commissionConfig?.categoryRates.find(
        (c) => c.category === payment.productId.category
      )?.rate || commissionConfig?.globalRate || 5;

    const commission = (payment.amount * commissionRate) / 100;
    const sellerAmount = payment.amount - commission;

    payment.status = "released";
    payment.commission = commission;
    await payment.save();

    res.json({
      message: "Payment released successfully",
      sellerAmount,
      commission,
    });
  } catch (error) {
    res.status(500).json({ message: "Escrow release failed" });
  }
};

// Seller Payouts
export const getSellerPayouts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const payouts = await Payment.find({ sellerId });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payouts" });
  }
};

export const releaseEscrow = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const escrow = await escrow.findById(escrowId);
    if (!escrow) return res.status(404).json({ message: "Escrow not found" });

    escrow.status = "released";
    await escrow.save();

    // Notify seller of release
    io.to(escrow.seller.toString()).emit("escrow_update", {
      message: "Funds have been released to your account",
      escrow,
    });

    await sendEmail({
      to: escrow.seller.email,
      subject: "Escrow Funds Released",
      text: `Your escrow payment for product ${escrow.product} has been released.`,
    });

    res.status(200).json({ message: "Escrow released successfully", escrow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


import Escrow from "../models/escrow.js";
import Commission from "../models/Commission.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { io } from "../utils/socket.js";

// 🧾 Buyer confirms receipt → release funds to seller
export const buyerConfirmDelivery = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const buyerId = req.user._id;

    const escrow = await Escrow.findById(escrowId).populate("seller buyer product");
    if (!escrow) return res.status(404).json({ message: "Escrow not found" });

    // Ensure correct buyer
    if (escrow.buyer._id.toString() !== buyerId.toString()) {
      return res.status(403).json({ message: "Unauthorized: You are not the buyer" });
    }

    // Ensure status is valid
    if (escrow.status !== "in_escrow") {
      return res.status(400).json({ message: "Escrow not ready for release" });
    }

    // 🧮 Calculate commission
    const category = escrow.product.category || "global";
    const commissionRate = await Commission.findOne({ category }) || await Commission.findOne({ category: "global" });
    const rate = commissionRate ? commissionRate.rate : 0;

    const commission = (escrow.amount * rate) / 100;
    const payoutAmount = escrow.amount - commission;

    // 💰 Update escrow
    escrow.status = "released";
    escrow.releasedAt = new Date();
    escrow.commission = commission;
    escrow.payoutAmount = payoutAmount;
    await escrow.save();

    // 💳 Update seller balance
    const seller = await User.findById(escrow.seller._id);
    seller.walletBalance = (seller.walletBalance || 0) + payoutAmount;
    await seller.save();

    // 🔔 Notify seller
    io.to(seller._id.toString()).emit("escrow_update", {
      message: `Funds released for product ${escrow.product.name}.`,
      escrow,
    });

    await sendEmail({
      to: seller.email,
      subject: "Escrow Released",
      text: `Funds for product "${escrow.product.name}" have been released. Amount credited: ₦${payoutAmount.toFixed(2)}.`,
    });

    res.status(200).json({
      message: "Funds released successfully",
      escrow,
      payoutAmount,
      commission,
    });
  } catch (error) {
    console.error("Buyer confirm delivery error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


import mongoose from "mongoose";
import Escrow from "../models/Escrow.js";
import Commission from "../models/Commission.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { io } from "../utils/socket.js";

export const buyerConfirmDelivery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { escrowId } = req.params;
    const buyerId = req.user._id;

    const escrow = await Escrow.findById(escrowId).populate("product").session(session);
    if (!escrow) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ message: "Escrow not found" });
    }
    if (escrow.buyer.toString() !== buyerId.toString()) {
      await session.abortTransaction(); session.endSession();
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (escrow.status !== "in_escrow") {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: "Escrow not ready for release" });
    }

    const commissionDoc = await Commission.findOne().session(session);
    let rate = commissionDoc?.globalRate ?? 5;
    const categoryRate = commissionDoc?.categoryRates?.find(c => c.category === escrow.product?.category);
    if (categoryRate) rate = categoryRate.rate;

    const commission = (escrow.amount * rate) / 100;
    const payoutAmount = escrow.amount - commission;

    // update escrow
    escrow.status = "released";
    escrow.commission = commission;
    escrow.payoutAmount = payoutAmount;
    escrow.releasedAt = new Date();
    await escrow.save({ session });

    // update seller wallet atomically
    const seller = await User.findById(escrow.seller).session(session);
    seller.walletBalance = (seller.walletBalance || 0) + payoutAmount;
    await seller.save({ session });

    await session.commitTransaction();
    session.endSession();

    // notify outside session (no DB writes)
    io.to(seller._id.toString()).emit("escrow_update", { message: "Funds released", escrow });
    await sendEmail({ to: seller.email, subject: "Escrow Released", text: `₦${payoutAmount} released.` });

    res.json({ message: "Released", escrow, payoutAmount, commission });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Buyer confirm delivery error:", err);
    res.status(500).json({ message: err.message });
  }
};

const express = require("express");
const router = express.Router();
const axios = require("axios");
const Order = require("../models/Order"); // your order model

// ✅ Verify Paystack payment
router.get("/verify/:reference", async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, data } = response.data;
    if (status && data.status === "success") {
      // Update order status
      const order = await Order.findOneAndUpdate(
        { reference },
        { paymentStatus: "paid", orderStatus: "processing" },
        { new: true }
      ).populate("buyer seller products");

      return res.json({ success: true, order });
    } else {
      res.status(400).json({ success: false, message: "Payment not verified" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
