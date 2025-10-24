import express from "express";
import { createReport, getAllReports, updateReport } from "../controllers/reportController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReport);
router.get("/all", protect, adminOnly, getAllReports);
router.put("/:id", protect, adminOnly, updateReport);

export default router;


// routes/reportRoutes.js
import express from "express";
import { upload } from "../middlewares/upload.js";
import Report from "../models/Report.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js"; // 🔒 new middleware

const router = express.Router();

// Existing routes (user report submission)
r// POST /api/reports
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

    const media = req.files.map((file) => ({
      url: `/uploads/reports/${file.filename}`,
      type: file.mimetype.startsWith("image") ? "image" : "video",
    }));

    const report = new Report({
      userId: req.user.id,
      productId,
      sellerUsername,
      reason,
      description,
      isPaymentRelated,
      escrowId,
      media,
    });

    await report.save();
    res.status(201).json({ message: "Report submitted successfully!", report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit report." });
  }
});

// GET /api/reports/admin
router.get("/admin", verifyAdmin, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("userId", "username email")
      .populate("productId", "title price")
      .populate("escrowId"); // 🔹 include escrow details

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports." });
  }
});



// 🔹 Admin: View all reports
router.get("/admin", verifyAdmin, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("userId", "username email")
      .populate("productId", "title price");
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports." });
  }
});

// 🔹 Admin: Update report status
router.put("/admin/:id", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json({ message: "Status updated successfully!", updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating report status." });
  }
});

// 🔹 Admin: Delete report
router.delete("/admin/:id", verifyAdmin, async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Report deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report." });
  }
});

/// 🧾 Get only payment-related reports
router.get("/payments", async (req, res) => {
  try {
    const reports = await Report.find({ isPaymentRelated: true }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment reports" });
  }
});

// ⚙️ Admin action on payment
router.put("/resolve/:reportId", async (req, res) => {
  const { action } = req.body; // "release" or "decline"

  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (!report.isPaymentRelated)
      return res.status(400).json({ message: "Not a payment-related report" });

    const escrow = await Escrow.findOne({ productId: report.productId });
    if (!escrow)
      return res.status(404).json({ message: "Escrow transaction not found" });

    if (action === "release") {
      escrow.status = "released";
      report.status = "resolved";
    } else if (action === "decline") {
      escrow.status = "declined";
      report.status = "declined";
    }

    await escrow.save();
    await report.save();

    res.json({ message: `Payment ${action} successfully`, report, escrow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Action failed" });
  }
});


export default router;
