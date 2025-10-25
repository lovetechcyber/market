// backend/models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: { type: [orderItemSchema], required: true },

    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    escrowAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NGN" },

    paymentProvider: { type: String, enum: ["paystack", "flutterwave", "manual"], default: "paystack" },
    paymentReference: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "authorized", "paid", "failed"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["pending", "paid", "in_escrow", "released", "refunded", "disputed", "cancelled"],
      default: "pending",
    },
    escrowReleasedAt: Date,
    escrowReleasedTxRef: String,

    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "in_transit", "delivered", "cancelled"],
      default: "processing",
    },

    dispute: {
      isOpen: { type: Boolean, default: false },
      reason: String,
      openedAt: Date,
      resolvedAt: Date,
      resolutionNote: String,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
