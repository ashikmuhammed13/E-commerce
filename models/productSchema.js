const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});
const Brand = mongoose.model("Brand", brandSchema);

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    isActive: { type: Boolean, default: true },
    oldprice: { type: Number, required: true },
    imageUrls: [{ type: String, required: true }],
    category: { type: String, required: true },
    countInStock: { type: Number, min: [1, 'Quantity must be above 0'] },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = { Product, Brand };



