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

// Store refresh tokens (memory storage – replace with Redis or DB in production)
let refreshTokens = [];

/* ============================================================
   SIGNUP
============================================================ */
router.post("/signup", async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { fullName, email, password, mobileNumber, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      mobileNumber,
      location,
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ============================================================
   LOGIN
============================================================ */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("🔵 Login attempt:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    refreshTokens.push(refreshToken);

    // Store refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // <-- FIX: make cookie accessible everywhere
    });

    res.json({
      message: "Login successful",
      accessToken,
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ============================================================
   REFRESH TOKEN
============================================================ */
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token provided" });

  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json({ message: "Invalid refresh token" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Expired refresh token" });
    }

    // ROTATE refresh token
    refreshTokens = refreshTokens.filter((t) => t !== refreshToken);

    const newRefreshToken = generateRefreshToken(user.id);
    refreshTokens.push(newRefreshToken);

    const newAccessToken = generateAccessToken(user.id);

    // Send new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    console.log("♻️ New access token issued for:", user.id);

    res.json({ accessToken: newAccessToken });
  });
});

/* ============================================================
   LOGOUT
============================================================ */
router.post("/logout", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  refreshTokens = refreshTokens.filter((t) => t !== refreshToken);

  res.clearCookie("refreshToken", { path: "/" });

  res.json({ message: "Logged out successfully" });
});

/* ============================================================
   TOGGLE FAVORITES
============================================================ */
router.post("/favorites/:productId", protect, async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user.id);

  const index = user.favorites.indexOf(productId);

  if (index === -1) user.favorites.push(productId);
  else user.favorites.splice(index, 1);

  await user.save();
  res.json(user.favorites);
});

export default router;
