const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderID: { type: String },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        isReturn: { 
            type: String, 
            enum: ['pending', 'processing', 'refunded', 'requested'], 
            default: 'pending' 
        }
    }],
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    totalAmount: { type: Number, required: true },
    totalPrice: { type: Number },
    discountAmount: { type: String },
    paymentMethod: { type: String, required: true },
    paymentIntentId: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled', 'paid'], 
        default: 'pending' 
    },
    stripeSessionId: { type: String },
    refund: { type: Boolean, default: false },
    stockUpdated: { type: Boolean, default: false },
    completeOrderReturn: { type: Boolean, default: false },
    deliveryExpectedDate: { type: Date },
    datePlaced: { type: Date, default: Date.now }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
