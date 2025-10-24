// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const axios = require('axios');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET; // keep secret in env
const FLW_SECRET = process.env.FLW_SECRET;

// create order and initialize payment (example: Paystack)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { sellerId, items, shipping = 0, paymentProvider='paystack', buyerDetails } = req.body;
    const subtotal = items.reduce((s,i) => s + i.price * i.quantity, 0);
    const escrowAmount = subtotal + shipping;

    const order = new Order({
      buyerId: req.user.id,
      sellerId,
      items,
      subtotal,
      shipping,
      escrowAmount,
      paymentProvider,
    });
    await order.save();

    // Initialize payment with Paystack (example)
    if (paymentProvider === 'paystack') {
      const initRes = await axios.post('https://api.paystack.co/transaction/initialize', {
        amount: escrowAmount * 100, // kobo
        email: buyerDetails.email,
        metadata: { orderId: order._id.toString() }
      }, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
      });

      order.paymentReference = initRes.data.data.reference;
      await order.save();

      return res.json({ order, authorization_url: initRes.data.data.authorization_url });
    }

    // TODO: add flutterwave / other providers
    res.json({ order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// verify endpoint (called after buyer completes payment or webhook)
router.post('/verify-paystack', async (req, res) => {
  // For hosted callback: you may receive reference as query param
  const { reference } = req.body; // or req.query
  try {
    const payRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });

    const data = payRes.data.data;
    const orderId = data.metadata.orderId;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send('Order not found');

    if (data.status === 'success') {
      order.paymentStatus = 'paid';
      order.status = 'in_escrow'; // funds received by platform
      order.paymentReference = reference;
      await order.save();
      // notify seller/buyer, etc.
      return res.json({ ok: true, order });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({ ok:false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// release
router.post('/release/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).send('Order not found');
    if (order.status !== 'in_escrow') return res.status(400).send('Order not in escrow');

    // seller's bank details should be saved in user profile (or subaccount)
    const seller = await User.findById(order.sellerId);
    if (!seller.bankAccount) return res.status(400).send('Seller bank details missing');

    // Create transfer recipient (if not created before) using Paystack Account API
    // then initiate transfer
    const recipientRes = await axios.post('https://api.paystack.co/transferrecipient', {
      type: 'nuban',
      name: seller.name,
      account_number: seller.bankAccount.number,
      bank_code: seller.bankAccount.bankCode,
      currency: 'NGN'
    }, { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }});

    const recipientCode = recipientRes.data.data.recipient_code;
    const transferRes = await axios.post('https://api.paystack.co/transfer', {
      source: 'balance',
      amount: order.escrowAmount * 100,
      recipient: recipientCode,
      reason: `Release order ${order._id}`
    }, { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }});

    order.status = 'released';
    order.escrowReleasedAt = new Date();
    order.escrowReleasedTxRef = transferRes.data.data.reference;
    await order.save();

    res.json({ ok:true, order, transfer: transferRes.data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});


router.put("/status/:id", async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("product", "name")
      .populate("buyer", "fullName email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// routes/orderRoutes.js
router.get("/user-orders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("buyer", "username")
      .populate("seller", "username")
      .populate("product", "name images");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
});
