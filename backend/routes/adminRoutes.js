import express from "express";
import {
  getCommission,
  updateGlobalCommission,
  getEscrowSummary,
   getEscrowSummary, updateEscrowStatus,
   getUsers,
  suspendUser,
  getProducts,
  deleteProduct,
  getAllUsers,
  suspendUser,
  deleteUser,
  getAllProducts,
  updateProductStatus,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
   getAllReports,
  getAllTickets,
  getCommission,
  updateCommission
} from "../controller/admin.js";
import { adminProtect } from "../middleware/authMiddleware.js";
import { getAnalytics } from "../controllers/analyticsController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/commission", adminProtect, getCommission);
router.post("/commission/global", adminProtect, updateGlobalCommission);
router.get("/escrow-summary", getEscrowSummary);
router.put("/escrow/:escrowId", updateEscrowStatus);

// Users
router.get("/users", protect, adminOnly, getUsers);
router.put("/users/suspend/:id", protect, adminOnly, suspendUser);

// Reports & Tickets
router.get("/reports", getAllReports);
router.get("/tickets", getAllTickets);

// Products
router.get("/products", protect, adminOnly, getProducts);
router.delete("/products/:id", protect, adminOnly, deleteProduct);
// Users
router.get("/users", getAllUsers);
router.put("/users/suspend/:id", suspendUser);
router.delete("/users/:id", deleteUser);
router.put("/unsuspend/:userId", verifyAdmin, adminController.unsuspendUser);

// Products
router.get("/products", getAllProducts);
router.put("/products/:id/status", updateProductStatus);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus)

// Commission
router.get("/commission", protect, adminOnly, getCommission);
router.put("/commission", protect, adminOnly, updateCommission);

// Analytics
router.get("/analytics", protect, adminOnly, getAnalytics);

export default router;


