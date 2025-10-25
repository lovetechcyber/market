import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String },
   mobileNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10,15}$/, "Invalid mobile number format"],
    },
    location: {
      state: { type: String, required: true },
      localGovernment: { type: String, required: true },
      town: { type: String, required: true },
    },
  ratings: [{ type: Number }],
  role: { type: String, default: 'user' }, // user / admin
  recentViews: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      viewedAt: { type: Date, default: Date.now }
    }
  ],
  balance: { type: Number, default: 0 },
  refreshTokens: [String],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
   // wishlist and cart
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 }
    }
  ],
  status: { type: String, enum: ["active", "suspended"], default: "active" },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
