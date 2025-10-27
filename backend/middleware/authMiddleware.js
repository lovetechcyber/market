// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Protect routes (requires token)
export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  console.log("🟢 Incoming token:", token);

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded token:", decoded);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("❌ User not found for decoded ID:", decoded.id);
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    console.log("✅ Authenticated user:", user.email);
    next();
  } catch (error) {
    console.error("🔥 JWT verification failed:", error.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ✅ Admin-only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};

// ✅ Verify user and handle suspension
export const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.status === "suspended") {
      return res.status(403).json({
        message: "Your account is suspended. Contact support.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};


