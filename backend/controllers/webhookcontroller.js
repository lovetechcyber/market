import crypto from "crypto";
import Escrow from "../models/Escrow.js";
import sendEmail from "../utils/sendEmail.js";
import { io } from "../utils/socket.js";

export const handlePaystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET;
    const hash = crypto.createHmac("sha512", secret)
      .update(req.body)
      .digest("hex");

    const signature = req.headers["x-paystack-signature"];
    if (hash !== signature) return res.status(401).send("Invalid signature");

    const event = JSON.parse(req.body.toString());
    if (event.event === "charge.success") {
      const data = event.data;

      const { metadata, amount, id } = data;
      const { buyerId, sellerId, productId } = metadata;

      // Check if escrow already exists
      const existing = await Escrow.findOne({ transactionId: id });
      if (existing) return res.status(200).send("Escrow already recorded");

      const escrow = await Escrow.create({
        buyer: buyerId,
        seller: sellerId,
        product: productId,
        amount: amount / 100,
        transactionId: id,
        status: "in_escrow",
      });

      // Notify seller
      io.to(sellerId.toString()).emit("escrow_update", {
        message: `Escrow funded for product ${productId}`,
        escrow,
      });

      await sendEmail({
        to: escrow.seller.email,
        subject: "Escrow Payment Confirmed",
        text: `Your escrow for product ${productId} is now active.`,
      });
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(500).send("Server Error");
  }
};
