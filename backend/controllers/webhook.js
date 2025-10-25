import crypto from "crypto";
import Payment from "../models/payment.js";

export const handlePaystackWebhook = async (req, res) => {
  try {
    // Verify Paystack signature
    const secret = process.env.PAYSTACK_SECRET;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.body)
      .digest("hex");

    const signature = req.headers["x-paystack-signature"];
    if (hash !== signature) {
      console.log("❌ Invalid Paystack signature");
      return res.status(401).send("Invalid signature");
    }

    // Parse event
    const event = JSON.parse(req.body.toString());
    const { event: eventType, data } = event;

    if (eventType === "charge.success" && data.status === "success") {
      const reference = data.reference;

      const payment = await Payment.findOne({ reference });
      if (!payment) {
        console.log("⚠️ No payment record found for reference:", reference);
        return res.status(404).send("Payment not found");
      }

      payment.status = "in_escrow";
      await payment.save();

      console.log(`✅ Payment moved to escrow: ${reference}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("⚠️ Webhook error:", error);
    res.status(500).send("Webhook handling failed");
  }
};
