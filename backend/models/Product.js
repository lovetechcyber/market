// backend/models/Product.js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  type: { type: String, enum: ['image', 'video'], default: 'image' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,

  category: {
    type: String,
    required: true,
    enum: [
      'Electronics',
      'Fashion',
      'Home & Kitchen',
      'Health & Beauty',
      'Sports',
      'Automobile',
      'Real Estate',
      'Services',
      'Others'
    ]
  },

  price: { type: Number, required: true },
  condition: { type: String, enum: ['new', 'used', 'refurbished'], default: 'new' },

  contact: { type: String, required: true }, // seller phone or WhatsApp

  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [mediaSchema],
  video: mediaSchema,

  viewsCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'sold', 'pending'], default: 'active' },
  salesCount: { type: Number, default: 0 },

  // tagging fields
  isLatest: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },

  location: {
  state: String,
  lga: String,
  city: String,
},
tag: { type: String, enum: ["Available", "Sold"], default: "Available" },



}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
