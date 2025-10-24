// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      title: String,
      price: Number,
      quantity: Number
    }
  ],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  escrowAmount: { type: Number, required: true }, // typically equals subtotal+shipping
  currency: { type: String, default: 'NGN' },

  // payment provider references
  paymentProvider: { type: String }, // 'paystack' | 'flutterwave' | ...
  paymentReference: { type: String }, // provider reference
  paymentStatus: { type: String, enum: ['pending','authorized','paid','failed'], default: 'pending' },

  // escrow lifecycle
  status: { 
    type: String, 
    enum: ['pending','paid','in_escrow','released','refunded','disputed','cancelled'], 
    default: 'pending' 
  },
  escrowReleasedAt: Date,
  escrowReleasedTxRef: String, // reference for the transfer to seller

    orderStatus: {
    type: String,
    enum: ["processing", "shipped", "in_transit", "delivered", "cancelled"],
    default: "processing",
  },

  // timestamps and dispute notes
  dispute: {
    isOpen: { type: Boolean, default: false },
    reason: String,
    openedAt: Date,
    resolvedAt: Date,
    resolutionNote: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
