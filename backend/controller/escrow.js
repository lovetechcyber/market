import Escrow from "../models/escrow.js";
import sendEmail from "../utils/sendEmail.js";
import { io } from "../utils/socket.js";

export const createEscrow = async (req, res) => {
  try {
    const { buyerId, sellerId, productId, amount, transactionId } = req.body;

    const escrow = await Escrow.create({
      buyer: buyerId,
      seller: sellerId,
      product: productId,
      amount,
      transactionId,
      status: "in_escrow",
    });

    // 🔔 Notify seller (email or socket)
    io.to(sellerId.toString()).emit("escrow_update", {
      message: `Escrow payment confirmed for product ID ${productId}`,
      escrow,
    });

    await sendEmail({
      to: req.sellerEmail,
      subject: "Escrow Payment Confirmed",
      text: `Payment for your product has been secured in escrow.`,
    });

    res.status(201).json({ message: "Escrow created successfully", escrow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
