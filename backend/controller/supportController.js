import Support from "../models/Support.js";

// Create new support ticket
export const createTicket = async (req, res) => {
  try {
    const ticket = await Support.create({
      userId: req.user.id,
      subject: req.body.subject,
      message: req.body.message,
      priority: req.body.priority || "low",
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's tickets
export const getUserTickets = async (req, res) => {
  try {
    const tickets = await Support.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: get all tickets
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Support.find().populate("userId", "fullName email");
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: respond to a ticket
export const respondTicket = async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.responses.push({
      sender: "admin",
      message: req.body.message,
    });

    ticket.status = req.body.status || ticket.status;
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
