import Escrow from "../models/pscrow.js";
import WalletWithdrawal from "../models/WalletWithdrawal.js";
import Payment from "../models/payment.js";
import Commission from "../models/Commission.js";

export const getEscrowSummary = async (req, res) => {
  try {
    const byStatus = await Escrow.aggregate([
      { $group: { _id: "$status", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const totals = await Escrow.aggregate([
      { $group: { _id: null, totalEscrow: { $sum: "$amount" } } },
    ]);

    const commissions = await Payment.aggregate([
      { $group: { _id: null, totalCommission: { $sum: "$commission" }, count: { $sum: 1 } } },
    ]);

    const withdrawals = await WalletWithdrawal.aggregate([
      { $group: { _id: "$status", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    res.json({ byStatus, totals: totals[0] || { totalEscrow: 0 }, commissions: commissions[0] || { totalCommission: 0 }, withdrawals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEscrowsForTable = async (req, res) => {
  try {
    // pagination + filters can be added
    const escrows = await Escrow.find().populate("buyer seller product").sort({ createdAt: -1 }).limit(200);
    res.json({ escrows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
