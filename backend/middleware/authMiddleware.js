import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ============================================================
   Extract Bearer Token
============================================================ */
const getToken = (req) => {
  const header = req.headers.authorization;
  if (!header) return null;

  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
};

/* ============================================================
   PROTECT ROUTES (Requires access token)
============================================================ */
export const protect = async (req, res, next) => {
  const token = getToken(req);

  console.log("🟢 Incoming access token:", token);

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
      shouldRefresh: true, // tells frontend to attempt refresh
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded access token:", decoded);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        message: "Your account is suspended. Contact support.",
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("🔥 Access token verification failed:", error.message);

    // EXPIRED TOKEN —> Frontend should request refresh()
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired",
        shouldRefresh: true, // <-- IMPORTANT
      });
    }

    // INVALID TOKEN
    return res.status(403).json({ message: "Invalid token" });
  }
};

/* ============================================================
   ADMIN-ONLY ROUTES
============================================================ */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access only" });
};

/* ============================================================
   VERIFY USER (For sensitive actions)
============================================================ */
export const verifyUser = async (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
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

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token expired", 
        shouldRefresh: true 
      });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};
