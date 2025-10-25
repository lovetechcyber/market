import mongoose from "mongoose";
import Commission from "../models/Commission.js";
import Escrow from "../models/Escrow.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Report from "../models/Report.js";
import Support from "../models/Support.js";
import sendEmail from "../utils/sendEmail.js";
import { io } from "../utils/socket.js";

/* ---------------------- COMMISSION ---------------------- */

// Get global commission config
export const getCommission = async (req, res) => {
  try {
    let config = await Commission.findOne().sort({ updatedAt: -1 });
    if (!config) config = await Commission.create({ type: "percentage", value: 5 });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update global commission
export const updateGlobalCommission = async (req, res) => {
  try {
    const { type = "percentage", value } = req.body;
    if (!["percentage", "fixed"].includes(type))
      return res.status(400).json({ error: "Invalid commission type" });
    if (typeof value !== "number" || value < 0)
      return res.status(400).json({ error: "Invalid commission value" });

    const config = await Commission.findOneAndUpdate(
      {},
      { type, value, updatedBy: req.user?.id },
      { new: true, upsert: true }
    );
    res.json({ message: "Commission updated", config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------- ESCROW ---------------------- */

// Escrow summary
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update escrow manually
export const updateEscrowStatus = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { status } = req.body;

    const escrow = await Escrow.findById(escrowId)
      .populate("seller", "email fullName")
      .populate("product", "title");

    if (!escrow) return res.status(404).json({ message: "Escrow not found" });

    escrow.status = status;
    await escrow.save();

    // Notify seller via socket
    io.to(escrow.seller._id.toString()).emit("escrow_update", {
      message: `Your escrow has been ${status}`,
      escrow,
    });

    // Email notification
    await sendEmail({
      to: escrow.seller.email,
      subject: `Escrow ${status}`,
      text: `Your escrow for product "${escrow.product.title}" is now ${status}.`,
    });

    res.json({ message: `Escrow ${status} successfully`, escrow });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------- USERS ---------------------- */

// Get paginated users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, role, status, q } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (q)
      filter.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];

    const users = await User.find(filter)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);
    res.json({ total, page: Number(page), limit: Number(limit), users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Suspend/Unsuspend user
export const toggleUserSuspend = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "suspended" ? "active" : "suspended";
    await user.save();

    res.json({
      message: `User ${user.status === "suspended" ? "suspended" : "reactivated"}`,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted", userId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------- PRODUCTS ---------------------- */

export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50, q, status } = req.query;
    const filter = {};
    if (q)
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    if (status) filter.status = status;

    const products = await Product.find(filter)
      .populate("seller", "fullName email")
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
    const { status, adminNotes } = req.body;
    const product = await Product.findByIdAndUpdate(
      id,
      { status, adminNotes },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted", productId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------- ORDERS ---------------------- */

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.$or = [{ orderId: q }, { "buyer.email": { $regex: q, $options: "i" } }];

    const orders = await Order.find(filter)
      .populate("buyer", "fullName email")
      .populate("seller", "fullName email")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);
    res.json({ total, page: Number(page), limit: Number(limit), orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    if (adminNote) {
      order.adminNotes = order.adminNotes || [];
      order.adminNotes.push({ adminId: req.user.id, note: adminNote, at: new Date() });
    }

    if (status === "released") order.releasedAt = new Date();

    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------- REPORTS & TICKETS ---------------------- */

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporterId", "fullName email")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Support
  .find()
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------- ANALYTICS ---------------------- */

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalBuyers = await User.countDocuments({ role: "buyer" });

    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: "active" });

    const ordersAgg = await Order.aggregate([
      { $match: { status: { $in: ["completed", "released", "in_escrow", "pending"] } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          totalEscrow: {
            $sum: { $cond: [{ $eq: ["$status", "in_escrow"] }, "$totalAmount", 0] },
          },
        },
      },
    ]);

    const orderStats = ordersAgg[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalEscrow: 0,
    };

    const pendingReports = await Report.countDocuments({ status: "pending" });
    const openTickets = await Support
  .countDocuments({
      status: { $in: ["open", "in_progress"] },
    });
    const disputes = await Order.countDocuments({ status: "dispute" });

    const topSellers = await Order.aggregate([
      { $match: { status: "released" } },
      {
        $group: {
          _id: "$seller",
          totalSales: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          sellerId: "$_id",
          sellerName: "$seller.fullName",
          sellerEmail: "$seller.email",
          totalSales: 1,
          count: 1,
        },
      },
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
      topSellers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
