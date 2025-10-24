import express from "express";
import { upload } from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";
import Report from "../models/Report.js";
import Escrow from "../models/Escrow.js";

const router = express.Router();

/**
 * 🧾 USER REPORTS
 * Handles user-submitted reports for products or payments.
 */

// ➕ Create a new report
router.post("/", verifyToken, upload.array("media", 5), async (req, res) => {
  try {
    const {
      productId,
      sellerUsername,
      reason,
      description,
      isPaymentRelated,
      escrowId,
    } = req.body;

    // 🖼️ Build media array
    const media = (req.files || []).map((file) => ({
      url: `/uploads/reports/${file.filename}`,
      type: file.mimetype.startsWith("image") ? "image" : "video",
    }));

    // 📝 Create report
    const report = await Report.create({
      userId: req.user.id,
      productId,
      sellerUsername,
      reason,
      description,
      isPaymentRelated,
      escrowId,
      media,
    });

    res.status(201).json({ message: "Report submitted successfully!", report });
  } catch (error) {
    console.error("Report submission failed:", error);
    res.status(500).json({ message: "Failed to submit report." });
  }
});

/**
 * 👩‍💼 ADMIN ROUTES
 * Restricted to verified admins only.
 */

// 📄 View all reports
router.get("/admin", verifyAdmin, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("userId", "username email")
      .populate("productId", "title price")
      .populate("escrowId");
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Error fetching reports." });
  }
});

// ✏️ Update report status
router.put("/admin/:id", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Report not found" });
    res.status(200).json({ message: "Status updated successfully!", updated });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ message: "Error updating report status." });
  }
});

// ❌ Delete a report
router.delete("/admin/:id", verifyAdmin, async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Report not found" });
    res.status(200).json({ message: "Report deleted successfully!" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Error deleting report." });
  }
});

/**
 * 💳 PAYMENT-RELATED REPORTS
 * Allows admin to handle disputes related to escrow transactions.
 */

// 🧾 Get only payment-related reports
router.get("/payments", verifyAdmin, async (req, res) => {
  try {
    const reports = await Report.find({ isPaymentRelated: true })
      .populate("userId", "username email")
      .populate("escrowId")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Error fetching payment reports:", err);
    res.status(500).json({ message: "Failed to fetch payment reports" });
  }
});

// ⚙️ Resolve payment dispute (release or decline)
router.put("/resolve/:reportId", verifyAdmin, async (req, res) => {
  const { action } = req.body; // "release" or "decline"

  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (!report.isPaymentRelated)
      return res.status(400).json({ message: "Not a payment-related report" });

    const escrow = await Escrow.findOne({ _id: report.escrowId });
    if (!escrow)
      return res.status(404).json({ message: "Escrow transaction not found" });

    if (action === "release") {
      escrow.status = "released";
      report.status = "resolved";
    } else if (action === "decline") {
      escrow.status = "declined";
      report.status = "declined";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await escrow.save();
    await report.save();

    res.json({ message: `Payment ${action}d successfully`, report, escrow });
  } catch (err) {
    console.error("Error resolving payment:", err);
    res.status(500).json({ message: "Action failed" });
  }
});

export default router;
