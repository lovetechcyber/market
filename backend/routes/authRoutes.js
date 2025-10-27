import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { signupSchema } from "./authValidator.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate Access Token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

// Store refresh tokens (in DB or Redis in production)
let refreshTokens = [];

/**
 * @route POST /api/auth/signup
 */
// SIGNUP
router.post("/signup", async (req, res) => {
  try {

    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { fullName, email, password, mobileNumber, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      mobileNumber,
      location,
    });

    console.log("✅ User created:", user._id);
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("🔥 Signup server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


/**
 * @route POST /api/auth/login
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("🟢 Incoming login data:", req.body); 
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user._id);
    console.log("🟢 accesstoken data:",accessToken); // Log the incoming request
    console.log("🟢 Incoming signup data:", user.id); // Log the incoming request
    const refreshToken = generateRefreshToken(user._id);
    console.log("🟢 refreshtoken data:", refreshToken); // Log the incoming request

    refreshTokens.push(refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh"
    });

    res.json({
      message: "Login successful",
      accessToken,
      user: { id: user._id, fullName: user.fullName, email: user.email }
    });
  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/logout", (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only secure in prod
      sameSite: "strict",
      path: "/", // must match the cookie path used during login
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Failed to log out" });
  }
});

router.post("/logout", (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only secure in prod
      sameSite: "strict",
      path: "/", // must match the cookie path used during login
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Failed to log out" });
  }
});


/**
 * @route POST /api/auth/refresh
 */
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });
  if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ message: "Invalid refresh token" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token expired or invalid" });

    const newAccessToken = generateAccessToken(user.id);
    res.json({ accessToken: newAccessToken });
  });
});

/**
 * @route POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.json({ message: "Logged out successfully" });
});

// Toggle favorite
router.post("/favorites/:productId", protect, async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user.id);

  const index = user.favorites.indexOf(productId);
  if (index === -1) {
    user.favorites.push(productId);
  } else {
    user.favorites.splice(index, 1);
  }
  await user.save();

  res.json(user.favorites);
});


export default router;
