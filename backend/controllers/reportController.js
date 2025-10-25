import Report from "../models/Report.js";

// Create report
export const createReport = async (req, res) => {
  try {
    const report = await Report.create({
      reporterId: req.user.id,
      targetId: req.body.targetId,
      type: req.body.type,
      reason: req.body.reason,
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: view all reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("reporterId", "fullName email");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: update report status
export const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = req.body.status || report.status;
    report.adminNotes = req.body.adminNotes || report.adminNotes;
    await report.save();

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
