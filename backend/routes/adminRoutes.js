import express from "express";
import {
  getCommission,
  updateGlobalCommission,
  getEscrowSummary,
  updateEscrowStatus,
  getAllUsers,
  toggleUserSuspend,
  deleteUser,
  getAllProducts,
  updateProductStatus,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllReports,
  getAllTickets,
} from "../controllers/admin.js";

import { getAnalytics } from "../controllers/analyticsController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Commission Routes
router.get("/commission", protect, adminOnly, getCommission);
router.put("/commission", protect, adminOnly, updateGlobalCommission);
router.post("/commission/global", protect, adminOnly, updateGlobalCommission);

// 🔹 Escrow Routes
router.get("/escrow-summary", protect, adminOnly, getEscrowSummary);
router.put("/escrow/:escrowId", protect, adminOnly, updateEscrowStatus);

// 🔹 User Management
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/suspend/:id", protect, adminOnly, toggleUserSuspend);
router.put("/users/unsuspend/:id", protect, adminOnly, toggleUserSuspend);
router.delete("/users/:id", protect, adminOnly, deleteUser);

// 🔹 Product Management
router.get("/products", protect, adminOnly, getAllProducts);
router.put("/products/:id/status", protect, adminOnly, updateProductStatus);
router.delete("/products/:id", protect, adminOnly, deleteProduct);

// 🔹 Order Management
router.get("/orders", protect, adminOnly, getAllOrders);
router.put("/orders/:id/status", protect, adminOnly, updateOrderStatus);

// 🔹 Reports & Support
router.get("/reports", protect, adminOnly, getAllReports);
router.get("/tickets", protect, adminOnly, getAllTickets);

// 🔹 Analytics
router.get("/analytics", protect, adminOnly, getAnalytics);

export default router;
