import mongoose from "mongoose";

const commissionSchema = mongoose.Schema({
  type: { type: String, enum: ["global", "category"], required: true },
  category: { type: String },
  percentage: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Commission", commissionSchema);
