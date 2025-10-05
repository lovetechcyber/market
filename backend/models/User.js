import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
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
  recentViews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  refreshTokens: [String],
}, { timestamps: true });

export default mongoose.model("User", userSchema);
