import Commission from "../models/Commission.js";
import Escrow from "../models/escrow.js";
import sendEmail from "../utils/sendEmail.js";
import { io } from "../utils/socket.js";

// Get commission settings
export const getCommission = async (req, res) => {
  try {
    const settings = await Commission.findOne() || await Commission.create({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error loading commission settings" });
  }
};

// Update global rate
export const updateGlobalCommission = async (req, res) => {
  try {
    const { rate } = req.body;
    const config = await Commission.findOneAndUpdate({}, { globalRate: rate }, { new: true });
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Failed to update commission rate" });
  }
};


export const getEscrowSummary = async (req, res) => {
  try {
    const summary = await Escrow.aggregate([
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Approve or decline escrow manually
export const updateEscrowStatus = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { status } = req.body;

    const escrow = await Escrow.findById(escrowId);
    if (!escrow) return res.status(404).json({ message: "Escrow not found" });

    escrow.status = status;
    await escrow.save();

    // Notify seller
    io.to(escrow.seller.toString()).emit("escrow_update", {
      message: `Your escrow has been ${status}`,
      escrow,
    });

    await sendEmail({
      to: escrow.seller.email,
      subject: `Escrow ${status}`,
      text: `Your escrow for product ${escrow.product} is now ${status}.`,
    });

    res.status(200).json({ message: `Escrow ${status} successfully`, escrow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Commission from "../models/Commission.js";

// USERS
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const suspendUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isSuspended = !user.isSuspended;
  await user.save();
  res.json({ message: `User ${user.isSuspended ? "suspended" : "unsuspended"}` });
};

// PRODUCTS
export const getProducts = async (req, res) => {
  const products = await Product.find().populate("userId", "fullName email");
  res.json(products);
};

export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};

// COMMISSION
export const getCommission = async (req, res) => {
  const commission = await Commission.findOne();
  res.json(commission);
};

export const updateCommission = async (req, res) => {
  const { type, value } = req.body;
  let commission = await Commission.findOne();
  if (!commission) commission = new Commission();
  commission.type = type || commission.type;
  commission.value = value || commission.value;
  await commission.save();
  res.json(commission);
};


import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Report from "../models/Report.js";
import Commission from "../models/Commission.js";
import SupportTicket from "../models/SupportTicket.js";
import mongoose from "mongoose";

/**
 * NOTE: Adjust field names if your User/Product/Order models use different property names.
 */

// ---------- Users ----------
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, role, status, q } = req.query;
    const filter = {};
    if (role) filter.role = role; // e.g., 'seller' or 'buyer' or 'admin'
    if (status) filter.status = status; // e.g., 'active' / 'suspended'
    if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];

    const users = await User.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-password")
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);
    res.json({ total, page: Number(page), limit: Number(limit), users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspend = true, reason } = req.body;
    const user = await User.findByIdAndUpdate(id, { status: suspend ? "suspended" : "active", suspendReason: reason }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: `User ${suspend ? "suspended" : "unsuspended"}`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Consider soft-delete instead. This physically deletes the user.
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    // Optionally: delete user's products/orders or mark them
    res.json({ message: "User deleted", userId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------- Products ----------
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50, q, status } = req.query;
    const filter = {};
    if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];
    if (status) filter.status = status; // e.g., 'active', 'flagged', 'deleted'
    const products = await Product.find(filter)
      .populate("seller", "name email")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Product.countDocuments(filter);
    res.json({ total, page: Number(page), limit: Number(limit), products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body; // status could be 'active', 'flagged', 'removed'
    const product = await Product.findByIdAndUpdate(id, { status, adminNotes }, { new: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // Option: soft-delete by setting status = 'removed'
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted", productId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------- Orders (Escrow aware) ----------
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, q } = req.query;
    const filter = {};
    if (status) filter.status = status; // pending, in_escrow, released, cancelled
    if (q) filter.$or = [{ orderId: q }, { "buyer.email": { $regex: q, $options: "i" } }];

    const orders = await Order.find(filter)
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);
    res.json({ total, page: Number(page), limit: Number(limit), orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * updateOrderStatus - Admin can force-change escrow status.
 * Example statuses: pending, in_escrow, released, cancelled, dispute
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // minimal validation
    order.status = status;
    if (adminNote) {
      order.adminNotes = order.adminNotes || [];
      order.adminNotes.push({ adminId: req.user.id, note: adminNote, at: new Date() });
    }

    // If releasing escrow, set payout fields (example)
    if (status === "released") {
      order.releasedAt = new Date();
      // set sellerPayout or create a payout job depending on your payout flow
      // order.payout = { amount: calculated, method: "balance" }
    }

    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------- Reports & Tickets ----------
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("reporterId", "name email").sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().populate("userId", "name email").sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------- Commission ----------
export const getCommission = async (req, res) => {
  try {
    let config = await Commission.findOne().sort({ updatedAt: -1 });
    if (!config) {
      // create default if missing
      config = await Commission.create({ type: "percentage", value: 5, updatedBy: req.user.id });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const setCommission = async (req, res) => {
  try {
    const { type, value } = req.body;
    if (!["percentage", "fixed"].includes(type)) return res.status(400).json({ error: "Invalid commission type" });
    if (typeof value !== "number" || value < 0) return res.status(400).json({ error: "Invalid commission value" });

    const config = await Commission.create({ type, value, updatedBy: req.user.id });
    res.status(201).json({ message: "Commission updated", config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------- Analytics ----------
export const analyticsOverview = async (req, res) => {
  try {
    // 1) Total users, sellers, buyers
    const totalUsers = await User.countDocuments({});
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalBuyers = await User.countDocuments({ role: "buyer" });

    // 2) Total products, active products
    const totalProducts = await Product.countDocuments({});
    const activeProducts = await Product.countDocuments({ status: "active" });

    // 3) Orders and revenue aggregation
    const ordersAgg = await Order.aggregate([
      {
        $match: { status: { $in: ["completed", "released", "in_escrow", "pending"] } }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          totalEscrow: {
            $sum: {
              $cond: [{ $eq: ["$status", "in_escrow"] }, "$totalAmount", 0]
            }
          }
        }
      }
    ]);

    const orderStats = ordersAgg[0] || { totalOrders: 0, totalRevenue: 0, totalEscrow: 0 };

    // 4) Disputes, pending reports, open tickets
    const pendingReports = await Report.countDocuments({ status: "pending" });
    const openTickets = await SupportTicket.countDocuments({ status: { $in: ["open", "in_progress"] } });
    const disputes = await Order.countDocuments({ status: "dispute" });

    // 5) Recent top sellers (by revenue) - adapt if you store revenue per seller
    const topSellers = await Order.aggregate([
      { $match: { status: "released" } },
      {
        $group: {
          _id: "$seller",
          totalSales: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "seller"
        }
      },
      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          sellerId: "$_id",
          sellerName: "$seller.name",
          sellerEmail: "$seller.email",
          totalSales: 1,
          count: 1
        }
      }
    ]);

    res.json({
      totalUsers,
      totalSellers,
      totalBuyers,
      totalProducts,
      activeProducts,
      orders: orderStats.totalOrders,
      revenue: orderStats.totalRevenue,
      escrowInHolding: orderStats.totalEscrow,
      pendingReports,
      openTickets,
      disputes,
      topSellers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { status: "suspended" }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `${user.fullName} has been suspended`, user });
  } catch (error) {
    res.status(500).json({ message: "Error suspending user", error });
  }
};

// Unsuspend user
exports.unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { status: "active" }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `${user.fullName} has been reactivated`, user });
  } catch (error) {
    res.status(500).json({ message: "Error unsuspending user", error });
  }
};