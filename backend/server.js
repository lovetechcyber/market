import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import product from "./routes/product.js";
import chatRoutes from "./routes/chatRoutes.js";
const wishlistRoutes = require("./routes/wishlistRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bodyParser from "body-parser";
import { initSocket } from "./utils/socket.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import walletRoutes from "./routes/wallet.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import disputeRoutes from "./routes/disput.js";

dotenv.config();
const app = express();
const server = http.createServer(app); // wrap express in http
const io = new Server(server, {
  cors: {
    origin: "*", // adjust in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Webhook raw parser route(s)
app.use("/api/webhook/paystack", bodyParser.raw({ type: "application/json" }));

// For webhook only (raw body)
app.post("/api/payments/webhook", bodyParser.raw({ type: "application/json" }), (req, res, next) => {
  req.isWebhook = true;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", product);
app.use("/api/chats", chatRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/disputes", disputeRoutes);

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // join chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  // send message
  socket.on("sendMessage", ({ chatId, message }) => {
    io.to(chatId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
initSocket(server);
