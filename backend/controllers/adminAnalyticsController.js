import escrow from "../models/Escrow.js";
import WalletWithdrawal from "../models/withdrawal.js";
import payment from "../models/Payment.js";
import Commission from "../models/Commission.js";

export const getescrowSummary = async (req, res) => {
  try {
    const byStatus = await escrow.aggregate([
      { $group: { _id: "$status", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const totals = await escrow.aggregate([
      { $group: { _id: null, totalescrow: { $sum: "$amount" } } },
    ]);

    const commissions = await payment.aggregate([
      { $group: { _id: null, totalCommission: { $sum: "$commission" }, count: { $sum: 1 } } },
    ]);

    const withdrawals = await WalletWithdrawal.aggregate([
      { $group: { _id: "$status", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    res.json({ byStatus, totals: totals[0] || { totalescrow: 0 }, commissions: commissions[0] || { totalCommission: 0 }, withdrawals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getescrowsForTable = async (req, res) => {
  try {
    // pagination + filters can be added
    const escrows = await escrow.find().populate("buyer seller product").sort({ createdAt: -1 }).limit(200);
    res.json({ escrows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
