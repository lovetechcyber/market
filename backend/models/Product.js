import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  title: { type: String, required: true },
  media: [String], // images, video URLs
  category: { type: String, required: true },
  price: { type: Number, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
