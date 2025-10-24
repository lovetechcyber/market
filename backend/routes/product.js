const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

/**
 * POST /api/products
 * Create product + upload media to Cloudinary
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, price, condition, contact } = req.body;

    if (!title || !price || !category || !contact) {
      return res.status(400).json({ message: 'Title, price, category, and contact are required' });
    }

    const product = new Product({
      title,
      description,
      category,
      price,
      condition,
      contact,
      seller: req.user._id
    });

    // Upload images
    if (req.files && req.files.images) {
      const imagesArr = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (const file of imagesArr) {
        const upload = await cloudinary.uploader.upload(file.path || file.tempFilePath, {
          folder: `marketplace/products/${req.user._id}`,
          resource_type: 'image'
        });
        product.images.push({
          url: upload.secure_url,
          public_id: upload.public_id,
          type: 'image'
        });
      }
    }

    // Upload video
    if (req.files && req.files.video) {
      const upload = await cloudinary.uploader.upload(req.files.video.path || req.files.video.tempFilePath, {
        folder: `marketplace/products/${req.user._id}`,
        resource_type: 'video'
      });
      product.video = {
        url: upload.secure_url,
        public_id: upload.public_id,
        type: 'video'
      };
    }

    await product.save();
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /api/products
 * List with optional filters: category, q, sellerId, skip, limit
 */

router.get('/', async (req, res) => {
  try {
    const { q, category, location } = req.query;
    const filter = {};

    if (q) filter.title = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    if (location) filter.location = location;

    const products = await Product.find(filter)
      .populate('seller', 'fullName location')
      .sort({ createdAt: -1 });

    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get distinct categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/**
 * GET /api/products/:id
 * Return product; increment view count and add to user's recentViews if authenticated
 */
router.get('/:id', authOptional, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('seller', 'fullName email');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.viewsCount = (product.viewsCount || 0) + 1;
    await product.save();

    if (req.user) {
      const existingIndex = req.user.recentViews.findIndex(
        rv => rv.productId?.toString() === id
      );
      if (existingIndex !== -1) req.user.recentViews.splice(existingIndex, 1);
      req.user.recentViews.unshift({ productId: product._id, viewedAt: new Date() });
      req.user.recentViews = req.user.recentViews.slice(0, 50);
      await req.user.save();
    }

    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/products/:id
 * Edit product (only seller)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const updatable = [
      'title',
      'description',
      'category',
      'price',
      'condition',
      'status',
      'contact',
      'isLatest'
    ];

    updatable.forEach(k => {
      if (req.body[k] !== undefined) product[k] = req.body[k];
    });

    await product.save();
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/products/:id
 * Delete product (only seller)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Delete Cloudinary assets
    for (const img of product.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id, { resource_type: 'image' });
      }
    }
    if (product.video?.public_id) {
      await cloudinary.uploader.destroy(product.video.public_id, { resource_type: 'video' });
    }

    await product.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/seller/:id/products
 * Seller dashboard list
 */
router.get('/seller/:id/products', authOptional, async (req, res) => {
  try {
    const sellerId = req.params.id;
    const products = await Product.find({ seller: sellerId }).sort({ createdAt: -1 });
    const totalSales = products.reduce((acc, p) => acc + (p.salesCount || 0), 0);
    const balance =
      req.user && req.user._id.toString() === sellerId ? req.user.balance : undefined;

    res.json({ products, totalSales, balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Optional auth middleware
 */
function authOptional(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return next();
  try {
    const payload = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    require('../models/User')
      .findById(payload.id)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(() => next());
  } catch {
    return next();
  }
}

// routes/productRoutes.js
router.patch("/:id/tag-sold", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { tag: "Sold" },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product tagged as SOLD", product });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product tag" });
  }
});


module.exports = router;
