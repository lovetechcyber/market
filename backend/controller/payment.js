import mongoose from "mongoose";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Payment from "../models/Payment.js";
import Escrow from "../models/Escrow.js";
import Order from "../models/Order.js";
import Commission from "../models/Commission.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { io } from "../utils/socket.js";

// 🧾 Initiate Escrow Payment (via Paystack)
export const initiateEscrowPayment = async (req, res) => {
  try {
    const { productId, amount } = req.body;
    const buyerId = req.user._id;

    const order = await Order.findById(productId).populate("seller");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const reference = uuidv4();

    const payment = await Payment.create({
      buyer: buyerId,
      seller: order.seller._id,
      productId,
      amount,
      reference,
      status: "pending",
    });

    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.user.email,
        amount: amount * 100,
        reference,
        callback_url: `${process.env.CLIENT_URL}/payment/verify/${reference}`,
      },
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    res.status(200).json({
      success: true,
      paymentUrl: paystackRes.data.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error("Payment initiation failed:", error);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};

// ✅ Verify Payment & Create Escrow
export const verifyEscrowPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { reference } = req.params;

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const data = verifyRes.data.data;
    if (data.status !== "success") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const payment = await Payment.findOneAndUpdate(
      { reference },
      { status: "in_escrow" },
      { new: true, session }
    );

    if (!payment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Payment not found" });
    }

    const escrow = await Escrow.create(
      [
        {
          buyer: payment.buyer,
          seller: payment.seller,
          product: payment.productId,
          amount: payment.amount,
          reference: payment.reference,
          status: "in_escrow",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, escrow: escrow[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Verification error:", error);
    res.status(500).json({ message: "Payment verification error" });
  }
};

// 🧾 Buyer Confirms Delivery → Release Funds
export const buyerConfirmDelivery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { escrowId } = req.params;
    const buyerId = req.user._id;

    const escrow = await Escrow.findById(escrowId)
      .populate("product seller")
      .session(session);

    if (!escrow)
      return res.status(404).json({ message: "Escrow record not found" });
    if (escrow.buyer.toString() !== buyerId.toString())
      return res.status(403).json({ message: "Unauthorized buyer" });
    if (escrow.status !== "in_escrow")
      return res.status(400).json({ message: "Escrow not ready for release" });

    const commissionDoc = await Commission.findOne().session(session);
    const categoryRate = commissionDoc?.categoryRates?.find(
      (r) => r.category === escrow.product.category
    );
    const rate = categoryRate?.rate ?? commissionDoc?.globalRate ?? 5;

    const commission = (escrow.amount * rate) / 100;
    const payout = escrow.amount - commission;

    escrow.status = "released";
    escrow.releasedAt = new Date();
    escrow.commission = commission;
    escrow.payoutAmount = payout;
    await escrow.save({ session });

    const seller = await User.findById(escrow.seller).session(session);
    seller.walletBalance = (seller.walletBalance || 0) + payout;
    await seller.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 🔔 Notify seller (outside transaction)
    io.to(seller._id.toString()).emit("escrow_update", {
      message: `Funds released for ${escrow.product.name}`,
      escrow,
    });

    await sendEmail({
      to: seller.email,
      subject: "Escrow Payment Released",
      text: `Your payment for "${escrow.product.name}" has been released. ₦${payout.toFixed(
        2
      )} credited.`,
    });

    res.status(200).json({ success: true, escrow, payout, commission });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Release error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 💰 Seller Payout History
export const getSellerPayouts = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const payouts = await Escrow.find({ seller: sellerId }).sort({
      createdAt: -1,
    });
    res.json(payouts);
  } catch (error) {
    console.error("Get payouts error:", error);
    res.status(500).json({ message: "Error fetching payouts" });
  }
};
