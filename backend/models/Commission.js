import mongoose from "mongoose";

const commissionSchema = mongoose.Schema({
  type: { type: String, enum: ["global", "category"], required: true },
  type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
  value: { type: Number, default: 5 }, // Default 5%
  category: { type: String },
  percentage: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Commission", commissionSchema);
