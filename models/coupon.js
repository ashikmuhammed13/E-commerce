const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    condition: {
        type: String,
        required: true,
    },
    minPriceRange: {
        type: Number,
        required: true
    },
    maxPriceRange: {
        type: Number,
        required: true
    },
    usageCount: {
        type: Number,
        default: 0
    },
    expireDate: {
        type: Date,
        required: true,
    },
    valid: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Coupon', couponSchema);
