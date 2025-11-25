import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    icon: { type: String }, // Optional (e.g., URL for UI)
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
