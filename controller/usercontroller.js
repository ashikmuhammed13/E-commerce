const { User, Address } = require("../models/userschema");
const mongoose = require('mongoose')
const bcrypt = require ("bcrypt");
const { generateOTP, sendOTP } = require('../utils/otp');
const { Product, Brand } = require("../models/productSchema")
const { Banner, MidBanner } = require('../models/banner');
const Cart = require("../models/cart")
const Coupon = require('../models/coupon');
const Order = require('../models/Order')
const Wishlist = require('../models/wishlist')
const logger = require('../utils/logger');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const home = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(25).populate('brand').exec();
        const firstPartProducts = products.slice(0, 4);
        const remainingProducts = products.slice(4, 12);
        const brands = await MidBanner.find()

        const banners = await Banner.find().sort({ createdAt: -1 });

        res.render('user/index', { firstPartProducts, remainingProducts, banners, brands });
    } catch (err) {
        logger.error(err);
        res.render('user/index', { errorMessage: 'Failed to load products' });
    }
};
const shop = async (req, res) => {
    try {
        const allBrands=await Brand.find()
        const shops = await Product.find().sort({ createdAt: -1 }).limit(25).populate("brand").exec(); // Fetch more than 12 to include best-selling products

        res.render('user/shop', { shops ,allBrands});
    } catch (err) {
        logger.error(err);
        res.render('user/shop', { errorMessage: 'Failed to load products' });
    }
};
const productdetail = async (req, res) => {
    try {
        const productId = req.query.q;
        // Validate the productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).render('user/productdetail', { errorMessage: 'Invalid product ID' });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).render('user/productdetail', { errorMessage: 'Product not found' });
        }
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(25).populate('brand').exec();
        const firstPartProducts = products.slice(0, 4);
        res.render('user/productdetail', { product, firstPartProducts });
    } catch (error) {
        logger.error('Error fetching product details:', error);
        res.status(500).render('user/productdetail', { errorMessage: 'Failed to load product details' });
    }
};
const banner = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        logger.error('Fetched banners:', banners); // Log the fetched banners
        res.render('user/index', { banners });
    } catch (err) {
        logger.error(err);
        res.render('user/index', { errorMessage: 'Failed to load banners' });
    }
};

//REMOVING CART PRODUCT
const removeCart = async (req, res) => {
    const { productId } = req.params;
    try {
        const userId = req.session.user ? req.session.user._id : null;
        if (userId) {
            // Logged-in user: Remove the product from the user's cart
            await Cart.updateOne({ userId }, { $pull: { items: { productId } } });
        } else {
            // Guest user: Remove the product from the session cart
            const guestCart = req.session.cart || { items: [] };
            guestCart.items = guestCart.items.filter(item => item.productId !== productId);
            // Save the updated cart back to the session
            req.session.cart = guestCart;
        }

        res.redirect("/showCart");
    } catch (error) {
        logger.error('Error removing from cart:', error);
        res.status(500).send('Internal server error');
    }
};
// Function to render the registration page
const userRegister = (req, res) => {
    if (req.session.user) {
        res.redirect("/");
    } else if (req.session.admin) {
        res.redirect("/admin");
    } else {
        res.render("user/register");
    }
};
// Function to handle user registration
const userRegistration = async (req, res) => {
    try {
        const { username, email, phone, password, cpassword } = req.body;

        if (password !== cpassword) {
            return res.render("user/register", { errorMessage: "Passwords do not match" });
        }

        const dbEmail = await User.findOne({ email });
        if (!dbEmail) {
            // const hashedPassword = await bcrypt.hash(password, 10);
            // logger.error("Hashed Password During Registration:", hashedPassword); // Debugging line

            const otp = generateOTP();
            const otpExpires = Date.now() + 3600000; // OTP expires in 1 hour

            const newUser = new User({
                username,
                email,
                phone,
                password,
                otp,
                otpExpires
            });

            await newUser.save();
            await sendOTP(email, otp);

            res.render('user/otp', { email });
        } else {
            res.render("user/register", { errorMessage: "Email already exists" });
        }
    } catch (error) {
        logger.error(error);
        res.render("user/register", { errorMessage: "Server error" });
    }
};
// Function to verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (user && user.otp === otp && user.otpExpires > Date.now()) {
            user.isVerified = true;
            user.otp = null;
            user.otpExpires = null;
            await user.save();

            req.session.user = user;
            res.redirect('/');
        } else {
            res.render('user/otp', { email, errorMessage: 'Invalid or expired OTP' });
        }
    } catch (error) {
        logger.error(error);
        res.render('user/otp', { email, errorMessage: 'Server error' });
    }
};
// Function to render the login page
const loginPage = (req, res) => {
    res.render("user/login", { errorMessage: req.flash("error") });
};
// Function to handle user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            req.flash("error", "Invalid email or password");
            logger.error("User not found");
            return res.redirect("/login");
        }

        logger.error(`User found: ${user.email}`);

        const isMatch = await user.matchPassword(password);
        logger.error("Password match result:", isMatch);

        if (!isMatch) {
            req.flash("error", "Invalid email or password");
            logger.error("Password mismatch");
            return res.redirect("/login");
        }

        if (!user.isVerified) {
            req.flash("error", "Account not verified. Please check your email for verification.");
            return res.redirect("/login");
        }

        req.session.user = user;

        res.redirect("/");
    } catch (err) {
        logger.error("Login error:", err);
        req.flash("error", "Server error");
        res.redirect("/login");
    }
};
// Function to handle user logout
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};

const updateCartQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.session.user ? req.session.user._id : null;
        let totalCartValue = 0;

        if (userId) {
            // User is logged in, update the database
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Cart not found' });
            }

            const productIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            if (productIndex === -1) {
                return res.status(404).json({ success: false, message: 'Product not found in cart' });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            cart.items[productIndex].quantity = quantity;
            cart.items[productIndex].totalPrice = product.price * quantity;
            await cart.save();

            // Calculate the total cart value
            totalCartValue = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

            return res.json({
                success: true,
                newQuantity: quantity,
                newTotalPrice: cart.items[productIndex].totalPrice,
                totalCartValue
            });
        } else {
            // User is not logged in, update the session cart
            let guestCart = req.session.cart || { items: [] };
            const productIndex = guestCart.items.findIndex(item => item.productId === productId);

            if (productIndex === -1) {
                return res.status(404).json({ success: false, message: 'Product not found in cart' });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            guestCart.items[productIndex].quantity = quantity;
            guestCart.items[productIndex].totalPrice = product.price * quantity;
            req.session.cart = guestCart;

            // Calculate the total cart value
            totalCartValue = guestCart.items.reduce((acc, item) => acc + item.totalPrice, 0);

            return res.json({
                success: true,
                newQuantity: quantity,
                newTotalPrice: guestCart.items[productIndex].totalPrice,
                totalCartValue
            });
        }
    } catch (error) {
        logger.error('Error updating cart quantity:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

//ADDING TO CART
const addToCart = async (req, res) => {
    try {
        const { q: productId } = req.query;

        if (!productId) {
            return res.status(400).send('No product ID provided');
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        if (req.session.user) {
            // User is logged in, handle user cart
            const userId = req.session.user._id;
            let cart = await Cart.findOne({ userId });

            if (cart) {
                const productInCart = cart.items.find(item => item.productId.toString() === productId);

                if (productInCart) {
                    // Update the existing product in the cart
                    await Cart.updateOne(
                        { userId, "items.productId": productId },
                        {
                            $inc: { "items.$.quantity": 1, "items.$.totalPrice": product.price }
                        }
                    );
                } else {
                    // Add a new product to the cart
                    await Cart.updateOne(
                        { userId },
                        {
                            $push: {
                                items: {
                                    productId: product._id,
                                    price: product.price,
                                    totalPrice: product.price,
                                    quantity: 1
                                }
                            }
                        }
                    );
                }
            } else {
                // If no cart exists, create a new one
                const newCart = new Cart({
                    userId: userId,
                    items: [{
                        productId: product._id,
                        price: product.price,
                        totalPrice: product.price,
                        quantity: 1
                    }]
                });
                await newCart.save();
            }
        } else {
            // User is not logged in, handle guest cart using session
            let guestCart = req.session.cart || { items: [] };

            const productInCart = guestCart.items.find(item => item.productId === productId);

            if (productInCart) {
                // Update the existing product in the cart
                productInCart.quantity += 1;
                productInCart.totalPrice += product.price;
            } else {
                // Add a new product to the cart
                guestCart.items.push({
                    productId: product._id.toString(),
                    price: product.price,
                    totalPrice: product.price,
                    quantity: 1
                });
            }

            // Save the guest cart back to the session
            req.session.cart = guestCart;
        }

        res.redirect("/showCart");
    } catch (error) {
        logger.error('Error adding to cart:', error);
        res.status(500).send('Internal server error');
    }
};

const showCart = async (req, res) => {
    try {
        let cartItems = [];

        if (req.session.user) {
            // User is logged in, fetch the cart from the database
            const userId = req.session.user._id;
            const userCart = await Cart.findOne({ userId }).populate('items.productId');

            if (!userCart || userCart.items.length === 0) {
                return res.status(404).render('user/cart', { errorMessage: 'Your cart is empty' });
            }

            // Use populated cart items
            cartItems = userCart.items;
        } else {
            // User is not logged in, fetch the cart from the session
            const guestCart = req.session.cart || { items: [] };

            if (guestCart.items.length === 0) {
                return res.status(404).render('user/cart', { errorMessage: 'Your cart is empty' });
            }

            // Fetch product details for the items in the guest cart
            const productDetails = await Product.find({
                _id: { $in: guestCart.items.map(item => item.productId) }
            });

            // Combine product details with cart items
            cartItems = guestCart.items.map(item => {
                const product = productDetails.find(prod => prod._id.toString() === item.productId);
                return {
                    productId: {
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        imageUrls: product.imageUrls // Ensure imageUrls is passed
                    },
                    quantity: item.quantity,
                    totalPrice: item.totalPrice
                };
            });
        }
        // Render the cart page with the products in the user's or guest's cart
        res.render('user/cart', { products: cartItems });
    } catch (error) {
        logger.error('Error fetching cart details:', error);
        res.status(500).render('user/cart', { errorMessage: 'Failed to load cart details' });
    }
};
const userEdit = async (req, res) => {
    const userId = req.query.id; // Fetch userId from query parameters
    const { username, phone } = req.body;

    try {
        const userEditing = await User.findByIdAndUpdate(userId, {
            username,
            phone,
        }, { new: true }); // 'new: true' returns the updated document

        if (!userEditing) {
            return res.status(404).send('User not found');
        }

        // Redirect back to the users page after updating
        res.redirect('/');
    } catch (error) {
        logger.error('Error updating user:', error);
        res.status(500).send('Server error');
    }
};

const addNewAddress = async (req, res) => {
    try {

        if (!req.session.user || !req.session.user._id) {
            throw new Error('User not authenticated or user ID missing');
        }

        const { firstName, lastName, streetAddress, city, state, country, postalCode, phone, email } = req.body;
        const userId = req.session.user._id;

        // Validate that all required fields are present
        if (!firstName || !lastName || !streetAddress || !city || !state || !country || !postalCode || !phone || !email) {
            throw new Error('All fields are required');
        }

        const newAddress = new Address({
            user: userId,
            firstName,
            lastName,
            streetAddress,
            city,
            state,
            country,
            postalCode,
            phone,
            email
        });

        await newAddress.save();
        res.redirect('/checkout');
    } catch (error) {
        logger.error('Error adding new address:', error);
        res.status(500).json({ success: false, message: 'Failed to add address' });
    }
}
const applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;
        const userId = req.session.user._id;

        const coupon = await Coupon.findOne({ code: couponCode, valid: true });

        if (!coupon) {
            return res.status(400).json({ message: 'Invalid or expired coupon code.' });
        }

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        const cartTotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        if (cartTotal < coupon.minPriceRange || cartTotal > coupon.maxPriceRange) {
            return res.status(400).json({ message: 'Coupon does not apply to this order.' });
        }

        const discount = coupon.discount;
        const newTotalPrice = cartTotal - discount;

        req.session.discountedTotal = newTotalPrice;
        req.session.appliedCoupon = couponCode;

        res.redirect('/checkout?couponApplied=true');
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
const getCheckoutPage = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const addresses = await Address.find({ user: userId });
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        const user = await User.findById(userId);
        const wallet = user.wallet


        const cartTotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
        const discountedTotal = req.session.discountedTotal || cartTotal;

        const currentDate = new Date();
        const availableCoupons = await Coupon.find({ expireDate: { $gte: currentDate }, valid: true });

        res.render('user/checkout', {
            addresses,
            cartItems: cart.items,
            cartTotal,
            discountedTotal,
            availableCoupons,
            wallet,
            couponApplied: req.session.appliedCoupon ? true : false
        });
    } catch (err) {
        res.redirect("/");
    }
}; 

const handlePayment = async (req, res) => {
    try {
        const { addressId, paymentType, totalCheckOutValue } = req.body;
        const userId = req.session.user._id;

        // Get cart details
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart) {
            return res.status(400).json({ error: 'Invalid cart.' });
        }

        const user = await User.findById(userId);
        let wallet = user.wallet; // Fetch user's wallet balance

        // Get address details
        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(400).json({ error: 'Invalid address.' });
        }

        const cartTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        const discountedTotal = req.session.discountedTotal || cartTotal;
        const discountAmount = cartTotal - discountedTotal;

        let session;

        // Adjust each item's totalPrice to reflect the discount
        const adjustedLineItems = cart.items.map(item => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.productId.name,
                },
                unit_amount: Math.max(item.price - Math.round(discountAmount / item.quantity), 0) * 100, // Ensure no negative prices
            },
            quantity: item.quantity,
        }));

        const generateOrderId = () => {
            return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        };

        // Handle Cash on Delivery payment
        if (paymentType === 'Cash on Delivery') {
            // Create the order with COD payment method
            const order = new Order({
                userId,
                orderID: generateOrderId(),
                shippingAddress: address._id,
                items: cart.items.map(item => ({
                    product: item.productId._id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                totalAmount: cartTotal,
                totalPrice: discountedTotal,
                discountAmount,
                paymentMethod: "Cash on Delivery",
                status: 'pending', // Set initial status to pending for COD orders
            });

            await order.save();

            // Clear the user's cart after order creation
            await Cart.deleteOne({ userId });

            // Clear coupon data after successful order creation
            delete req.session.discountedTotal;
            delete req.session.appliedCoupon;

            return res.status(200).json({ message: 'Order placed successfully with Cash on Delivery.' });
        }

        // Wallet payment logic
        if (paymentType === "Wallet") {
            if (wallet >= discountedTotal) {
                // Deduct from wallet if balance covers the total
                user.wallet -= discountedTotal;
                await user.save();

                // Create the order with wallet payment
                const order = new Order({
                    userId,
                    orderID: generateOrderId(),
                    shippingAddress: address._id,
                    items: cart.items.map(item => ({
                        product: item.productId._id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    totalAmount: cartTotal,
                    totalPrice: discountedTotal,
                    discountAmount,
                    paymentMethod: "Wallet",
                    status: 'processing', // Mark the order as processing
                });

                await order.save();

                // Clear the user's cart after order creation
                await Cart.deleteOne({ userId });

                // Clear coupon data after successful order creation
                delete req.session.discountedTotal;
                delete req.session.appliedCoupon;

                return res.status(200).json({ message: 'Order placed successfully using Wallet.' });
            } else {
                // Wallet balance covers part of the total, deduct the balance, and use another method for the remaining
                const remainingAmount = discountedTotal - wallet;
                user.wallet = 0; // Empty the wallet
                await user.save();

                // Continue with Stripe or other payment method for the remaining amount
                if (remainingAmount > 0) {
                    session = await stripe.checkout.sessions.create({
                        payment_method_types: ['card'],
                        mode: 'payment',
                        line_items: adjustedLineItems,
                        success_url: `${req.protocol}://${req.get('host')}/order-success?session_id={CHECKOUT_SESSION_ID}`,
                        cancel_url: `${req.protocol}://${req.get('host')}/checkout`,
                        metadata: {
                            cartId: cart._id.toString(),
                            userId: userId.toString(),
                            addressId: address._id.toString(),
                            appliedCoupon: req.session.appliedCoupon || 'None',
                            discountAmount: discountAmount.toString(),
                        },
                    });

                    // Create order with partial wallet payment and Stripe
                    const order = new Order({
                        userId,
                        orderID: generateOrderId(),
                        shippingAddress: address._id,
                        items: cart.items.map(item => ({
                            product: item.productId._id,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        totalAmount: cartTotal,
                        totalPrice: discountedTotal,
                        discountAmount,
                        paymentMethod: "Wallet and Stripe",
                        paymentIntentId: session.id,
                        stripeSessionId: session.id,
                        status: 'processing',
                    });

                    await order.save();
                    await Cart.deleteOne({ userId });
                    delete req.session.discountedTotal;
                    delete req.session.appliedCoupon;

                    return res.status(200).json({ url: session.url });
                }
            }
        }


        // Handle Stripe payments if selected
        if (paymentType === 'Stripe Payment') {
            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: adjustedLineItems,
                success_url: `${req.protocol}://${req.get('host')}/order-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.protocol}://${req.get('host')}/checkout`,
                metadata: {
                    cartId: cart._id.toString(),
                    userId: userId.toString(),
                    addressId: address._id.toString(),
                    appliedCoupon: req.session.appliedCoupon || 'None',
                    discountAmount: discountAmount.toString(),
                },
            });

            const order = new Order({
                userId,
                orderID: generateOrderId(),
                shippingAddress: address._id,
                items: cart.items.map(item => ({
                    product: item.productId._id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                totalAmount: cartTotal,
                totalPrice: discountedTotal,
                discountAmount,
                paymentMethod: "Stripe Payment",
                paymentIntentId: session.id,
                stripeSessionId: session.id,
                status: 'pending',
            });

            await order.save();
            await Cart.deleteOne({ userId });
            delete req.session.discountedTotal;
            delete req.session.appliedCoupon;

            return res.status(200).json({ url: session.url });
        }
    } catch (error) {
        logger.error('Error processing payment:', error);
        res.status(500).json({ error: 'An error occurred while processing your payment.' });
    }
};
//GETING THE ORDERCONFIRMATION PAGE
const payment = async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            // Handle case for Cash on Delivery or non-Stripe payments
            const order = await Order.findOne({ userId: req.session.user._id }).sort({ createdAt: -1 });
            if (!order) {
                return res.status(400).json({ error: 'Order not found.' });
            }
            return res.render("user/orderConfirmation", {
                message: "Order placed successfully with Cash on Delivery.",
                order
            });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);
        logger.error('Stripe Session:', session);

        // Find the order associated with the session_id
        const order = await Order.findOne({ stripeSessionId: session_id }).populate('items.product');
        if (!order) {
            return res.status(400).json({ error: 'Order not found.' });
        }

        if (session.payment_status === 'paid') {
            order.status = 'processing';

            // Deduct stock for the ordered items if not done yet
            if (!order.stockUpdated) {
                for (const item of order.items) {
                    const product = await Product.findById(item.product._id);
                    if (!product) {
                        logger.error(`Product not found: ${item.product._id}`);
                        return res.status(404).json({ error: 'Product not found.' });
                    }
                    product.stock -= item.quantity;
                    await product.save();
                }
                order.stockUpdated = true;
            }
        } else {
            order.status = 'canceled';
        }

        await order.save();

        // Render the order confirmation page with order details
        res.render('user/orderConfirmation', {
            message: session.payment_status === 'paid' ? 'Your order has been successfully placed!' : 'Your order could not be processed.',
            order
        });
    } catch (error) {
        logger.error('Error confirming order payment:', error);
        res.status(500).json({ error: 'An error occurred while confirming your order.' });
    }
};
const orderPage = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const orders = await Order.find({ userId }).populate('items.product').exec();
        const user = await User.findById(userId).exec();
        res.render('user/userProfile', { orders, user });
    } catch (err) {
        res.render("user/login");
    }
};
const returns = async (req, res) => {
    try {
        const { orderId, productId, returnReason } = req.body; // Extract from req.body
        logger.error("Return Request Received:", { orderId, productId, returnReason });

        // Update the isReturn field for the specific product in the order
        const order = await Order.findOneAndUpdate(
            { _id: orderId, "items.product": productId },
            { $set: { "items.$.isReturn": "requested" } },
            { new: true }
        ).populate('items.product');

        if (!order) {
            logger.error("Order not found or product not in order.");
            return res.status(404).json({ success: false, message: 'Order or Product not found.' });
        }

        logger.error("Order Updated Successfully:", order);
        res.json({ success: true, message: 'Return request submitted successfully!' });
    } catch (err) {
        logger.error("Error Processing Return Request:", err);
        res.status(500).json({ success: false, message: 'Error processing return request.' });
    }
};
const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { id: productId } = req.body;

        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, products: [] })
        }
        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
        }
        res.status(200).json({ success: true, message: 'product added to wishlist' })
    }
    catch (err) {
        logger.error(err);
        res.status(500).json({ success: false, message: 'internal server error' })
    }
}
const getWishlist = async (req, res) => {
    try {
        if (req.session && req.session.user && req.session.user._id) {
            const userId = req.session.user._id;

            // Find the wishlist by userId and populate the products
            const wishlist = await Wishlist.findOne({ user: userId }).populate('products');

            // Render the wishlist page, passing the wishlist object
            res.render('user/wishlist', { wishlist, user: req.session.user });
        } else {
            // User is not logged in, render the 'else' part of your template
            res.render('user/wishlist', { wishlist: null, user: null });
        }
    } catch (err) {
        logger.error(err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const removeWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.query.q; // Get productId from query parameter
        logger.error("productId",productId,userId)


        // Find the wishlist by userId and pull the productId from the wishlist's items array
        const removing = await Wishlist.findOneAndUpdate(
            { userId },
            { $pull: { products: productId } },  // Assuming 'products' contains product IDs
            { new: true }  // Return the updated document
        );

        // Redirect or render the wishlist page after the update
        res.redirect("/wishlist");
    } catch (err) {
        logger.error(err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const editUser = async (req, res) => {
    try {       
        logger.error("userId:0",userId)
      const userId = req.session._id; // Assuming session stores _id
      const { username, phone } = req.body;
      logger.error("userId:0",userId)
  
      // Use User.findByIdAndUpdate correctly
      const edit = await User.findByIdAndUpdate(userId, {
        username: username,
        phone: phone,
      }, { new: true });
  
      if (edit) {
        res.redirect("/profile"); // Redirect to the profile page after update
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      logger.error("Error updating profile:", error);
      res.status(500).send("Server error");
    }
  };  
const getPassword=async(req,res)=>{
    res.render("user/forgetPassoword", { errorMessage: req.flash("error") });
};

const forgetPassword = async (req, res) => {
     
    try {
        // Get the email from the request body
        const { email } = req.body;
        
        // Check if the email exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            // Redirect to login if the email does not exist
            return res.redirect("/login");
        }
          
        // Generate a 6-digit OTP
        const otp = generateOTP();
        const otpExpires = Date.now() + 3600000; // OTP expiration time (1 hour)

        // Store the OTP and expiration time in the user's document in the database
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send the OTP to the user's email
        await sendOTP(email, otp);

        // Render the OTP verification page
        res.render('user/forgetVerify', { email });
    } catch (error) {
        logger.error(error);
        // Handle errors
        res.render("user/register", { errorMessage: "Server error" });
    }
};

const otpCheck = async (req, res) => {
    
    try {
        const { otp } = req.body; // Get OTP from the request body

        // Find the user with the matching OTP and ensure it's still valid (not expired)
        const user = await User.findOne({ 
            otp, 
            otpExpires: { $gt: Date.now() }  // OTP should not be expired
        });

        if (!user) {
            // If no matching user is found or OTP expired, show an error message
            return res.render("user/register", { errorMessage: "Invalid or expired OTP" });
        }

        
        // OTP is valid, render the password reset page
       res.render("user/enterPassword", { email: user.email });
 // Pass email to next view
    } catch (error) {
        logger.error(error);
        // Render an error message if there's a server error
        res.render("user/register", { errorMessage: "Server error occurred" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        logger.error("user",email)

        if (!password) {
            return res.render("user/enterPassword", { errorMessage: "Password is required" });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("user/enterPassword", { errorMessage: "User not found" });
        }

        // Update the password (save hook will hash it)
        user.password = password;
        user.otp = null;  // Clear OTP after successful reset
        user.otpExpires = null;  // Clear OTP expiration

        // Save the user, which will trigger the 'pre' hook to hash the password
        await user.save();

        res.redirect("/login");  // Redirect to login after password reset
    } catch (error) {
        logger.error(error);
        res.render("user/enterPassword", { errorMessage: "Server error occurred" });
}}
    
const search = async (req, res) => {
        try {
            const allBrands = await Brand.find();
            const { q, brand, category, min_price, max_price, new_arrivals, date_added } = req.query;
    
            // Create a base query object for the search
            let query = {
                isActive: true, 
            };
    
            // Apply name filter if search query (q) is provided
            if (q) {
                query.name = { $regex: q, $options: 'i' }; 
            }
    
            // Apply brand filter
            if (brand && brand !== 'All Brands') {
                const brandData = await Brand.findOne({ name: brand });
                if (brandData) {
                    query['brand'] = brandData._id;
                }
            }
    
            // Apply price range filter
            if (min_price || max_price) {
                query['price'] = {};
                if (min_price) query['price'].$gte = parseFloat(min_price);
                if (max_price) query['price'].$lte = parseFloat(max_price);
            }
    
            // Apply stock availability filter if 'new_arrivals' is checked
            if (new_arrivals) {
                query['isActive'] = true;
            }
    
            // Apply date filter
            if (date_added) {
                let daysAgo = new Date();
                daysAgo.setDate(daysAgo.getDate() - parseInt(date_added));
                query.createdAt = { $gte: daysAgo };
            }
    
            // Fetch filtered products
            const products = await Product.find(query).populate('brand');
    
            // Render the search results page
            res.render('searchResults', {
                searchQuery: q,
                products,
                allBrands,
            });
        } catch (err) {
            logger.error(err);
            res.status(500).send('Server error');
        }
};

// Export all controller functions
module.exports = {
    home,
    userRegister,
    userRegistration,
    verifyOTP,
    loginUser,
    loginPage,
    logout,
    productdetail,
    shop,
    showCart,
    addToCart,
    removeCart,
    updateCartQuantity,
    getCheckoutPage,
    userEdit,
    applyCoupon,
    addNewAddress,
    payment,
    handlePayment,
    orderPage,
    returns,
    addToWishlist,
    getWishlist,
    removeWishlist,
    editUser,
    forgetPassword,
    getPassword,
    otpCheck,
    resetPassword,
    search
}; 