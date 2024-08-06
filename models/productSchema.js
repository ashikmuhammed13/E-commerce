// const mongoose = require("mongoose");

// const productSchema = mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//     },
//     images: [
//       {
//         type: String,
//       },
//     ],
//     brand: {
//       type: String,
//       required: true,
//     },
//     category: {
//       type: String,
//       required: true,
//     },
//     tags: [
//       {
//         type: String,
//       },
//     ],
//     regularPrice: {
//       type: Number,
//       required: true,
//     },
//     salePrice: {
//       type: Number,
//     },
//     countInStock: {
//       type: Number,
//       required: true,
//       min: [1, "Quantity must be above 1"],
//       default: 0,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// const Product = mongoose.model("Products", productSchema);
// module.exports = Product;

// models/productSchema.js
// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     description: { type: String, required: true },
//     price: { type: Number, required: true },
//     imageUrl: { type: String, required: true },
//     category: { type: String, required: true },
//     countInStock: { type: Number, min: [1, 'Quantity must be above 0'] }
// });

// const Product = mongoose.model('Product', productSchema);

// module.exports = Product;
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    oldprice: { type: Number, required: true },
    imageUrls: [{ type: String, required: true }],
    category: { type: String, required: true },
    countInStock: { type: Number, min: [1, 'Quantity must be above 0'] },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;


