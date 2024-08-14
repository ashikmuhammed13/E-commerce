const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    guestId: String,
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        price: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true
        },
        countinstock: {
            type: Number,
            min: [1, 'Quantity must be above 0'],
            required: true
        }
    }],
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
