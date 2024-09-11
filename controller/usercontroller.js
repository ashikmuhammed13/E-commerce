// const { User,Address } = require("../models/userschema");
// const mongoose = require('mongoose')
// const bcrypt = require("bcrypt");
// const { generateOTP, sendOTP } = require('../utils/otp');
// const {Product,Brand}=require("../models/productSchema")
// const { Banner } = require('../models/banner');
// const Cart=require("../models/cart")

// const home = async (req, res) => {
//     try {
//         const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(25).populate('brand').exec();
//         const firstPartProducts = products.slice(0, 12);
//         const remainingProducts = products.slice(12);

//         const banners = await Banner.find().sort({ createdAt: -1 });

//         res.render('user/index', { firstPartProducts, remainingProducts, banners });
//     } catch (err) {
//         console.error(err);
//         res.render('user/index', { errorMessage: 'Failed to load products' });
//     }
// };
// const   shop = async (req, res) => {
//     try {
//         const shops = await Product.find().sort({ createdAt: -1 }).limit(25).populate("brand").exec(); // Fetch more than 12 to include best-selling products

//         res.render('user/shop', { shops });
//     } catch (err) {
//         console.error(err);
//         res.render('user/shop', { errorMessage: 'Failed to load products' });
//     }
// };
// const productdetail = async (req, res) => {
//     try {
//         const productId = req.query.q;
//         // Validate the productId
//         if (!mongoose.Types.ObjectId.isValid(productId)) {
//             return res.status(400).render('user/productdetail', { errorMessage: 'Invalid product ID' });
//         }
//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).render('user/productdetail', { errorMessage: 'Product not found' });
//         }
//         res.render('user/productdetail', { product });
//     } catch (error) {
//         console.error('Error fetching product details:', error);
//         res.status(500).render('user/productdetail', { errorMessage: 'Failed to load product details' });
//     }
// };
// const banner = async (req, res) => {
//     try {
//         const banners = await Banner.find().sort({ createdAt: -1 });
//         console.log('Fetched banners:', banners); // Log the fetched banners
//         res.render('user/index', { banners });
//     } catch (err) {
//         console.error(err);
//         res.render('user/index', { errorMessage: 'Failed to load banners' });
//     }
// };
// // const cart= async (req, res) => {
// //     try {
// //         const { q: productId } = req.query;
// //         console.log('Product ID received:', productId);

// //         if (!productId) {
// //             return res.status(400).send('No product ID provided');
// //         }

// //         const product = await Product.findById(productId);
// //         if (!product) {
// //             return res.status(404).send('Product not found');
// //         }

// //         res.send(`Product in cart: ${product.name}`);
// //     } catch (error) {
// //         console.error('Error fetching product details:', error);
// //         res.status(500).send('Failed to load product details');
// //     }
// // };


// // const getCart = async (req, res) => {
// //     const userId = req.session.user ? req.session.user._id : null;
// //     if (!userId) {
// //         return res.status(401).send('User not authenticated');
    
// //     try {
// //       const cart = await Cart.findOne({ user: userId }).populate("items.product");
  
// //       if (!cart) {
// //         return res.render("user/cart", { cart: { items: [] }, cartTotal: 0 });
// //       }
// //       const cartTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);
  
// //       res.render("user/cart", { cart, cartTotal });
// //     } catch (err) {
// //       console.log(err);
// //       res.status(500).send("Server error");
// //     }
// //     }}

// const miniCart = async (req, res) => {
//     try {
//         let items = [];
//         let subtotal = 0;

//         if (req.session.user) {
//             // Handle logged-in user cart
//             const userId = req.session.user._id;
//             const userCart = await Cart.findOne({ userId }).populate("items.productId");

//             if (userCart && userCart.items.length > 0) {
//                 items = userCart.items.map(item => ({
//                     product: item.productId,
//                     quantity: item.quantity,
//                     totalPrice: item.totalPrice
//                 }));

//                 subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
//             }
//         } else {
//             // Handle guest cart
//             const guestCart = req.session.cart || { items: [] };

//             if (guestCart.items.length > 0) {
//                 const productIds = guestCart.items.map(item => item.productId);
//                 const products = await Product.find({ _id: { $in: productIds } });

//                 items = guestCart.items.map(item => {
//                     const product = products.find(p => p._id.toString() === item.productId.toString());
//                     return {
//                         product: product,
//                         quantity: item.quantity,
//                         totalPrice: item.totalPrice
//                     };
//                 });

//                 subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
//             }
//         }

//         res.render('user/cart', { items, subtotal });
//     } catch (error) {
//         console.error('Error displaying mini cart:', error);
//         res.status(500).send('Internal server error');
//     }
// };
// //REMOVING CART PRODUCT
// const removeCart = async (req, res) => {
//     const { productId } = req.params;
//     try {
//         const userId = req.session.user ? req.session.user._id : null;
//         if (userId) {
//             // Logged-in user: Remove the product from the user's cart
//             await Cart.updateOne({ userId }, { $pull: { items: { productId } } });
//         } else {
//             // Guest user: Remove the product from the session cart
//             const guestCart = req.session.cart || { items: [] };
//             guestCart.items = guestCart.items.filter(item => item.productId !== productId);
//             // Save the updated cart back to the session
//             req.session.cart = guestCart;
//         }

//         res.redirect("/showCart");
//     } catch (error) {
//         console.error('Error removing from cart:', error);
//         res.status(500).send('Internal server error');
//     }
// };
// // Function to render the registration page
// const userRegister = (req, res) => {
//     if (req.session.user) {
//         res.redirect("/");
//     } else if (req.session.admin) {
//         res.redirect("/admin");
//     } else {
//         res.render("user/register");
//     }
// };
// // Function to handle user registration
// const userRegistration = async (req, res) => {
//     try {
//         const { username, email, phone, password, cpassword } = req.body;

//         if (password !== cpassword) {
//             return res.render("user/register", { errorMessage: "Passwords do not match" });
//         }

//         const dbEmail = await User.findOne({ email });
//         if (!dbEmail) {
//             // const hashedPassword = await bcrypt.hash(password, 10);
//             // console.log("Hashed Password During Registration:", hashedPassword); // Debugging line

//             const otp = generateOTP();
//             const otpExpires = Date.now() + 3600000; // OTP expires in 1 hour

//             const newUser = new User({
//                 username,
//                 email,
//                 phone,
//                 password,
//                 otp,
//                 otpExpires
//             });

//             await newUser.save();
//             await sendOTP(email, otp);

//             res.render('user/otp', { email });
//         } else {
//             res.render("user/register", { errorMessage: "Email already exists" });
//         }
//     } catch (error) {
//         console.error(error);
//         res.render("user/register", { errorMessage: "Server error" });
//     }
// };
// // Function to verify OTP
// const verifyOTP = async (req, res) => {
//     try {
//         const { email, otp } = req.body;

//         const user = await User.findOne({ email });

//         if (user && user.otp === otp && user.otpExpires > Date.now()) {
//             user.isVerified = true;
//             user.otp = null;
//             user.otpExpires = null;
//             await user.save();

//             req.session.user = user;
//             res.redirect('/');
//         } else {
//             res.render('user/otp', { email, errorMessage: 'Invalid or expired OTP' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.render('user/otp', { email, errorMessage: 'Server error' });
//     }
// };
// // Function to render the login page
// const loginPage = (req, res) => {
//     res.render("user/login", { errorMessage: req.flash("error") });
// };
// // Function to handle user login
// const loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });

//         if (!user) {
//             req.flash("error", "Invalid email or password");
//             console.log("User not found");
//             return res.redirect("/login");
//         }

//         console.log(`User found: ${user.email}`);

//         const isMatch = await user.matchPassword(password);
//         console.log("Password match result:", isMatch);

//         if (!isMatch) {
//             req.flash("error", "Invalid email or password");
//             console.log("Password mismatch");
//             return res.redirect("/login");
//         }

//         if (!user.isVerified) {
//             req.flash("error", "Account not verified. Please check your email for verification.");
//             return res.redirect("/login");
//         }

//         req.session.user = user;

//         console.log("User logged in successfully", "req.session.user:", req.session.user);
//         res.redirect("/");
//     } catch (err) {
//         console.error("Login error:", err);
//         req.flash("error", "Server error");
//         res.redirect("/login");
//     }
// };
// // Function to handle user logout
// const logout = (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             return res.redirect('/');
//         }
//         res.clearCookie('connect.sid');
//         res.redirect('/login');
//     });
// };
 
// const updateCartQuantity = async (req, res) => {
//     try {
//         const { productId, quantity } = req.body;
//         const userId = req.session.user ? req.session.user._id : null;
//         let totalCartValue = 0;

//         if (userId) {
//             // User is logged in, update the database
//             const cart = await Cart.findOne({ userId });
//             if (!cart) {
//                 return res.status(404).json({ success: false, message: 'Cart not found' });
//             }

//             const productIndex = cart.items.findIndex(item => item.productId.toString() === productId);
//             if (productIndex === -1) {
//                 return res.status(404).json({ success: false, message: 'Product not found in cart' });
//             }

//             const product = await Product.findById(productId);
//             if (!product) {
//                 return res.status(404).json({ success: false, message: 'Product not found' });
//             }

//             cart.items[productIndex].quantity = quantity;
//             cart.items[productIndex].totalPrice = product.price * quantity;
//             await cart.save();

//             // Calculate the total cart value
//             totalCartValue = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

//             return res.json({
//                 success: true,
//                 newQuantity: quantity,
//                 newTotalPrice: cart.items[productIndex].totalPrice,
//                 totalCartValue
//             });
//         } else {
//             // User is not logged in, update the session cart
//             let guestCart = req.session.cart || { items: [] };
//             const productIndex = guestCart.items.findIndex(item => item.productId === productId);

//             if (productIndex === -1) {
//                 return res.status(404).json({ success: false, message: 'Product not found in cart' });
//             }

//             const product = await Product.findById(productId);
//             if (!product) {
//                 return res.status(404).json({ success: false, message: 'Product not found' });
//             }

//             guestCart.items[productIndex].quantity = quantity;
//             guestCart.items[productIndex].totalPrice = product.price * quantity;
//             req.session.cart = guestCart;

//             // Calculate the total cart value
//             totalCartValue = guestCart.items.reduce((acc, item) => acc + item.totalPrice, 0);

//             return res.json({
//                 success: true,
//                 newQuantity: quantity,
//                 newTotalPrice: guestCart.items[productIndex].totalPrice,
//                 totalCartValue
//             });
//         }
//     } catch (error) {
//         console.error('Error updating cart quantity:', error);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// };

// //ADDING TO CART
// const addToCart = async (req, res) => {
//     try {
//         const { q: productId } = req.query;

//         if (!productId) {
//             return res.status(400).send('No product ID provided');
//         }

//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).send('Product not found');
//         }

//         if (req.session.user) {
//             // User is logged in, handle user cart
//             const userId = req.session.user._id;
//             let cart = await Cart.findOne({ userId });

//             if (cart) {
//                 const productInCart = cart.items.find(item => item.productId.toString() === productId);

//                 if (productInCart) {
//                     // Update the existing product in the cart
//                     await Cart.updateOne(
//                         { userId, "items.productId": productId },
//                         {
//                             $inc: { "items.$.quantity": 1, "items.$.totalPrice": product.price }
//                         }
//                     );
//                 } else {
//                     // Add a new product to the cart
//                     await Cart.updateOne(
//                         { userId },
//                         {
//                             $push: {
//                                 items: {
//                                     productId: product._id,
//                                     price: product.price,
//                                     totalPrice: product.price,
//                                     quantity: 1
//                                 }
//                             }
//                         }
//                     );
//                 }
//             } else {
//                 // If no cart exists, create a new one
//                 const newCart = new Cart({
//                     userId: userId,
//                     items: [{
//                         productId: product._id,
//                         price: product.price,
//                         totalPrice: product.price,
//                         quantity: 1
//                     }]
//                 });
//                 await newCart.save();
//             }
//         } else {
//             // User is not logged in, handle guest cart using session
//             let guestCart = req.session.cart || { items: [] };

//             const productInCart = guestCart.items.find(item => item.productId === productId);

//             if (productInCart) {
//                 // Update the existing product in the cart
//                 productInCart.quantity += 1;
//                 productInCart.totalPrice += product.price;
//             } else {
//                 // Add a new product to the cart
//                 guestCart.items.push({
//                     productId: product._id.toString(),
//                     price: product.price,
//                     totalPrice: product.price,
//                     quantity: 1
//                 });
//             }

//             // Save the guest cart back to the session
//             req.session.cart = guestCart;
//         }

//         res.redirect("/showCart");
//     } catch (error) {
//         console.error('Error adding to cart:', error);
//         res.status(500).send('Internal server error');
//     }
// };

// const showCart = async (req, res) => {
//     try {
//         let cartItems = [];

//         if (req.session.user) {
//             // User is logged in, fetch the cart from the database
//             const userId = req.session.user._id;
//             const userCart = await Cart.findOne({ userId }).populate('items.productId');

//             if (!userCart || userCart.items.length === 0) {
//                 return res.status(404).render('user/cart', { errorMessage: 'Your cart is empty' });
//             }

//             // Use populated cart items
//             cartItems = userCart.items;
//         } else {
//             // User is not logged in, fetch the cart from the session
//             const guestCart = req.session.cart || { items: [] };

//             if (guestCart.items.length === 0) {
//                 return res.status(404).render('user/cart', { errorMessage: 'Your cart is empty' });
//             }

//             // Fetch product details for the items in the guest cart
//             const productDetails = await Product.find({ 
//                 _id: { $in: guestCart.items.map(item => item.productId) }
//             });

//             // Combine product details with cart items
//             cartItems = guestCart.items.map(item => {
//                 const product = productDetails.find(prod => prod._id.toString() === item.productId);
//                 return { 
//                     productId: {
//                         _id: product._id,
//                         name: product.name,
//                         price: product.price,
//                         imageUrls: product.imageUrls // Ensure imageUrls is passed
//                     },
//                     quantity: item.quantity,
//                     totalPrice: item.totalPrice
//                 };
//             });
//         }
//         // Render the cart page with the products in the user's or guest's cart
//         res.render('user/cart', { products: cartItems });
//     } catch (error) {
//         console.error('Error fetching cart details:', error);
//         res.status(500).render('user/cart', { errorMessage: 'Failed to load cart details' });
//     }
// };


// const createAddress = async (req, res) => {
//     try {
//         const { firstName, lastName, companyName, streetAddress, apartment, city, state, postalCode, country, email, phone } = req.body;
//         console.log("body", req.body);

//         const userId = req.session.user._id; // Adjusted to retrieve from the session

//         if (!userId) {
//             return res.status(401).render("user/login", { errorMessage: "Please log in to proceed." });
//         }

//         const address = new Address({
//             userId, firstName, lastName, companyName, streetAddress, apartment, city, state, postalCode, country, email, phone
//         });
//         await address.save();

//         res.render("user/checkout");
//     } catch (error) {
//         console.error(error);
//         res.render("/", { errorMessage: "Server error" });
//     }
// };



// const availableAddress = async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const addresses = await Address.find({ userId });

//         if (addresses.length === 0) {
//             return res.status(404).json({ addresses: [] });
//         }

//         res.json({ addresses });
//     } catch (error) {
//         console.error("Error in availableAddress function:", error);
//         res.status(500).json({ errorMessage: "Server error" });
//     }
// };

// const applyAddress = async (req, res) => {
//     try {
//         const { addressId } = req.body;
//         const address = await Address.findById(addressId);

//         if (!address) {
//             return res.redirect('/checkout');
//         }

//         // Retrieve product data from session be
//         const cartItems = req.session.cartItems || [];
//         const cartTotal = req.session.cartTotal || 0;

//         // Render the checkout page with the selected address and product data
//         res.render("user/checkout", { address, orders: cartItems, cartTotal });
//     } catch (error) {
//         console.error(error);
//         res.render("/", { errorMessage: "Server error" });
//     }
// };


// // i made checkout get page and orders together
// const  checkout= async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const cart = await Cart.findOne({ userId }).populate('items.productId');
        
//         if (!cart || !cart.items.length) {
//             return res.redirect('/cart'); // Redirect if the cart is empty
//         }

//         const cartTotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
        
//         // Store product data in session because while applying the select address cant get product beacause its in checkout route
//         req.session.cartItems = cart.items;
//         req.session.cartTotal = cartTotal;

//         res.render("user/checkout", { orders: cart.items, cartTotal });
//     } catch (error) {
//         console.error(error);
//         res.render("user/checkout", { errorMessage: "Server error" });
//     }
// };
 


// module.exports = { home,userRegister, userRegistration, verifyOTP, loginUser, loginPage, logout,productdetail,shop,showCart,addToCart,removeCart,updateCartQuantity,createAddress,availableAddress,applyAddress,checkout};
  

const { User,Address } = require("../models/userschema");
const mongoose = require('mongoose')
const bcrypt = require("bcrypt");
const { generateOTP, sendOTP } = require('../utils/otp');
const {Product,Brand}=require("../models/productSchema")
const { Banner } = require('../models/banner');
const Cart=require("../models/cart")
const Coupon = require('../models/coupon');
const Order = require('../models/Order')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const home = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(25).populate('brand').exec();
        const firstPartProducts = products.slice(0, 12);
        const remainingProducts = products.slice(12);

        const banners = await Banner.find().sort({ createdAt: -1 });

        res.render('user/index', { firstPartProducts, remainingProducts, banners });
    } catch (err) {
        console.error(err);
        res.render('user/index', { errorMessage: 'Failed to load products' });
    }
};
const   shop = async (req, res) => {
    try {
        const shops = await Product.find().sort({ createdAt: -1 }).limit(25).populate("brand").exec(); // Fetch more than 12 to include best-selling products

        res.render('user/shop', { shops });
    } catch (err) {
        console.error(err);
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
        res.render('user/productdetail', { product });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).render('user/productdetail', { errorMessage: 'Failed to load product details' });
    }
};
const banner = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        console.log('Fetched banners:', banners); // Log the fetched banners
        res.render('user/index', { banners });
    } catch (err) {
        console.error(err);
        res.render('user/index', { errorMessage: 'Failed to load banners' });
    }
};
// const cart= async (req, res) => {
//     try {
//         const { q: productId } = req.query;
//         console.log('Product ID received:', productId);

//         if (!productId) {
//             return res.status(400).send('No product ID provided');
//         }

//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).send('Product not found');
//         }

//         res.send(`Product in cart: ${product.name}`);
//     } catch (error) {
//         console.error('Error fetching product details:', error);
//         res.status(500).send('Failed to load product details');
//     }
// };


// const getCart = async (req, res) => {
//     const userId = req.session.user ? req.session.user._id : null;
//     if (!userId) {
//         return res.status(401).send('User not authenticated');
    
//     try {
//       const cart = await Cart.findOne({ user: userId }).populate("items.product");
  
//       if (!cart) {
//         return res.render("user/cart", { cart: { items: [] }, cartTotal: 0 });
//       }
//       const cartTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);
  
//       res.render("user/cart", { cart, cartTotal });
//     } catch (err) {
//       console.log(err);
//       res.status(500).send("Server error");
//     }
//     }}

const miniCart = async (req, res) => {
    try {
        let items = [];
        let subtotal = 0;

        if (req.session.user) {
            // Handle logged-in user cart
            const userId = req.session.user._id;
            const userCart = await Cart.findOne({ userId }).populate("items.productId");

            if (userCart && userCart.items.length > 0) {
                items = userCart.items.map(item => ({
                    product: item.productId,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice
                }));

                subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
            }
        } else {
            // Handle guest cart
            const guestCart = req.session.cart || { items: [] };

            if (guestCart.items.length > 0) {
                const productIds = guestCart.items.map(item => item.productId);
                const products = await Product.find({ _id: { $in: productIds } });

                items = guestCart.items.map(item => {
                    const product = products.find(p => p._id.toString() === item.productId.toString());
                    return {
                        product: product,
                        quantity: item.quantity,
                        totalPrice: item.totalPrice
                    };
                });

                subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
            }
        }

        res.render('user/cart', { items, subtotal });
    } catch (error) {
        console.error('Error displaying mini cart:', error);
        res.status(500).send('Internal server error');
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
        console.error('Error removing from cart:', error);
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
            // console.log("Hashed Password During Registration:", hashedPassword); // Debugging line

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
        console.error(error);
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
        console.error(error);
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
            console.log("User not found");
            return res.redirect("/login");
        }

        console.log(`User found: ${user.email}`);

        const isMatch = await user.matchPassword(password);
        console.log("Password match result:", isMatch);

        if (!isMatch) {
            req.flash("error", "Invalid email or password");
            console.log("Password mismatch");
            return res.redirect("/login");
        }

        if (!user.isVerified) {
            req.flash("error", "Account not verified. Please check your email for verification.");
            return res.redirect("/login");
        }

        req.session.user = user;

        console.log("User logged in successfully", "req.session.user:", req.session.user);
        res.redirect("/");
    } catch (err) {
        console.error("Login error:", err);
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
        console.error('Error updating cart quantity:', error);
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
        console.error('Error adding to cart:', error);
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
        console.error('Error fetching cart details:', error);
        res.status(500).render('user/cart', { errorMessage: 'Failed to load cart details' });
    }
};




const userEdit = async (req, res) => {
    const userId = req.query.id; // Fetch userId from query parameters
    const { username,phone } = req.body;

    console.log('Received userId:', userId);
    console.log('Received data:', req.body);

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
        console.error('Error updating user:', error);
        res.status(500).send('Server error');
    }
};

// const createAddress = async (req, res) => {
//     try {
//         const { firstName, lastName, companyName, streetAddress, apartment, city, state, postalCode, country, email, phone } = req.body;
//         const userId = req.session.user._id;

//         if (!userId) {
//             return res.status(401).render("user/login", { errorMessage: "Please log in to proceed." });
//         }

//         // Check if the same address already exists for the user if there than it wont create new address 
//         const existingAddress = await Address.findOne({
//             userId,
//             firstName,
//             lastName,
//             companyName,
//             streetAddress,
//             apartment,
//             city,
//             state,
//             postalCode,
//             country,
//             email,
//             phone
//         });

//         if (existingAddress) {
//             return res.render("user/checkout", { message: "This address already exists." });
//         }

//         // Create a new address if it doesn't exist
//         const address = new Address({
//             userId,
//             firstName,
//             lastName,
//             companyName,
//             streetAddress,
//             apartment,
//             city,
//             state,
//             postalCode,
//             country,
//             email,
//             phone
//         });
//         await address.save();

//         res.render("user/checkout", { message: "Address saved successfully." });
//     } catch (error) {
//         console.error(error);
//         res.render("/", { errorMessage: "Server error" });
//     }
// };

// const availableAddress = async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const addresses = await Address.find({ userId });

//         if (addresses.length === 0) {
//             return res.status(404).json({ addresses: [] });
//         }

//         res.json({ addresses });
//     } catch (error) {
//         console.error("Error in availableAddress function:", error);
//         res.status(500).json({ errorMessage: "Server error" });
//     }
// };

// const applyAddress = async (req, res) => {
//     try {
//         const { addressId } = req.body;
//         const address = await Address.findById(addressId);

//         if (!address) {
//             return res.redirect('/checkout');
//         }

//         // Retrieve product data from session because we have kept in checkout page to get product
//         const cartItems = req.session.cartItems || [];
//         const cartTotal = req.session.cartTotal || 0;
//         const allCoupon= req.session.allCoupon 
        

//         // Render the checkout page with the selected address and product data
//         res.render("user/checkout", { address, orders: cartItems, cartTotal ,allCoupon});
//     } catch (error) {
//         console.error(error);
//         res.render("/", { errorMessage: "Server error" });
//     }
// };
 

// i made checkout get page and orders together get
// const  checkout= async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const cart = await Cart.findOne({ userId }).populate('items.productId');
        
//         if (!cart || !cart.items.length) {
//             return res.redirect('/cart'); // Redirect if the cart is empty
//         }

//         const cartTotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
//         const allCoupon=await Coupon.find()
//         // Store product data in session because while applying the select address cant get product beacause its in checkout route
//         req.session.cartItems = cart.items;
//         req.session.cartTotal = cartTotal;
        
        

//         res.render("async function getCheckoutPage(req, res) {
//     try {
//         const userId = req.session.userId;

//         // Fetch existing addresses for the user
//         const addresses = await Address.find({ userId });

//         // Assuming you have product data and cart logic handled elsewhere
//         const cartItems = [
//             { name: "Vestibulum suscipit", quantity: 1, total: 165 },
//             { name: "Vestibulum dictum magna", quantity: 1, total: 50 }
//         ];

//         const cartTotal = cartItems.reduce((acc, item) => acc + item.total, 0);

//         // Fetch available coupons
//         const currentDate = new Date();
//         const availableCoupons = await Coupon.find({ expireDate: { $gte: currentDate }, valid: true });

//         // Render checkout page with addresses, cart items, cart total, and available coupons
//         res.render('checkout', {
//             addresses,
//             cartItems,
//             cartTotal,
//             availableCoupons // Add available coupons to the rendered view
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send('Error rendering checkout page');
//     }
// }
// ", { orders: cart.items, cartTotal});
//     } catch (error) {
//         console.error(error);
//         res.render("user/checkout", { errorMessage: "Server error" });
//     }
// };

// const applyCoupon = async (req, res) => {
//     try {
//         const { couponCode } = req.body;
//         const userId = req.session.user._id;

//         const cart = await Cart.findOne({ userId }).populate('items.productId');
//         if (!cart || !cart.items.length) {
//             return res.redirect('/cart'); // Redirect if the cart is empty
//         }

//         const coupon = await Coupon.findOne({ code: couponCode });
//         if (!coupon || !coupon.valid || coupon.expireDate < Date.now()) {
//             return res.render("user/checkout", { 
//                 orders: cart.items, 
//                 cartTotal: cart.items.reduce((acc, item) => acc + item.totalPrice, 0),
//                 errorMessage: "Invalid or expired coupon.",
//                 discountApplied: false 
//             });
//         }

//         const cartTotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

//         if (cartTotal < coupon.minPriceRange || cartTotal > coupon.maxPriceRange) {
//             return res.render("user/checkout", { 
//                 orders: cart.items, 
//                 cartTotal,
//                 errorMessage: "Cart total does not meet coupon conditions.",
//                 discountApplied: false
//             });
//         }

//         const discountedTotal = Math.max(cartTotal - coupon.discount, 0); // Ensure total doesn't go negative
        
//         // Optionally update usage count
//         coupon.usageCount += 1;
//         await coupon.save();

//         // Update session with the new discounted total
//         req.session.cartTotal = discountedTotal;

//         res.render("user/checkout", { 
//             orders: cart.items, 
//             cartTotal: discountedTotal, 
//             discountApplied: true 
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).render("user/checkout", {
//             errorMessage: "Server error while applying coupon.",
//             discountApplied: false
//         });
//     }
// };

// const handleSubmit = async (event) => {
//     event.preventDefault();
//     const { paymentMethod, error } = await stripe.createPaymentMethod({
//         type: 'card',
//         card: cardElement,
//     });

//     if (error) {
//         // Display error.message in your UI
//         document.getElementById('error-message').textContent = error.message;
//     } else {
//         // Send the PaymentMethod ID to your server
//         const response = await fetch('/create-payment-intent', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ paymentMethodId: paymentMethod.id })
//         });

//         const paymentResult = await response.json();

//         if (paymentResult.error) {
//             document.getElementById('error-message').textContent = paymentResult.error;
//         } else {
//             // If successful, redirect to an order confirmation page
//             window.location.href = '/order-confirmation';
//         }
//     }
// };

// const orderPlace = async (req, res) => {
//     try {
//         const {
//             firstName,
//             lastName,
//             companyName,
//             streetAddress,
//             apartment,
//             city,
//             state,
//             postalCode,
//             country,
//             email,
//             phone,
//             paymentMethod,
//             paymentMethodId
//         } = req.body;

//         const userId = req.session.user._id;

//         if (!userId) {
//             return res.status(401).render("user/login", { errorMessage: "Please log in to proceed." });
//         }

//         let cart = req.session.cart || await Cart.findOne({ userId });

//         if (!cart || !cart.items || cart.items.length === 0) {
//             return res.status(400).render("user/cart", { errorMessage: "Your cart is empty. Please add items to your cart before placing an order." });
//         }

//         const totalAmount = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

//         let address = await Address.findOne({
//             userId,
//             firstName,
//             lastName,
//             companyName,
//             streetAddress,
//             apartment,
//             city,
//             state,
//             postalCode,
//             country,
//             email,
//             phone
//         });

//         if (!address) {
//             address = new Address({
//                 userId,
//                 firstName,
//                 lastName,
//                 companyName,
//                 streetAddress,
//                 apartment,
//                 city,
//                 state,
//                 postalCode,
//                 country,
//                 email,
//                 phone
//             });
//             await address.save();
//         }

//         if (paymentMethod === 'COD') {
//             const order = new Order({
//                 userId,
//                 orderID: `ORD-${Date.now()}`,
//                 items: cart.items.map(item => ({
//                     product: item.productId,
//                     quantity: item.quantity,
//                     price: item.price
//                 })),
//                 shippingAddress: address._id,
//                 totalAmount,
//                 paymentMethod: 'COD',
//                 status: 'pending'
//             });
//             await order.save();
//             res.render("user/orderConfirmation", { message: "Order placed successfully with Cash on Delivery.", order });

//         } else if (paymentMethod === 'Stripe') {
//             const amount = totalAmount * 100;

//             const paymentIntent = await stripe.paymentIntents.create({
//                 amount,
//                 currency: 'inr',
//                 payment_method: paymentMethodId,
//                 confirmation_method: 'manual',
//                 confirm: true,
//                 return_url: 'https://your-domain.com/checkout/complete'
//             });

//             if (paymentIntent.status === 'requires_action') {
//                 res.send({ requiresAction: true, clientSecret: paymentIntent.client_secret });
//             } else if (paymentIntent.status === 'succeeded') {
//                 const order = new Order({
//                     userId,
//                     orderID: `ORD-${Date.now()}`,
//                     items: cart.items.map(item => ({
//                         product: item.productId,
//                         quantity: item.quantity,
//                         price: item.price
//                     })),
//                     shippingAddress: address._id,
//                     totalAmount,
//                     paymentMethod: 'Stripe',
//                     paymentIntentId: paymentIntent.id,
//                     status: 'paid'
//                 });
//                 await order.save();
//                 res.render("user/orderConfirmation", { message: "Order placed successfully with Stripe.", order });
//             } else {
//                 res.status(400).send({ error: "Payment failed, please try again." });
//             }
//         } else {
//             res.status(400).send({ error: "Invalid payment method selected." });
//         }

//         cart.items = [];
//         await cart.save();
//         req.session.cart = null;

//     } catch (error) {
//         console.error('Error processing order:', error);
//         res.status(500).send({ error: "An error occurred while processing your order. Please try again later." });
//     }
// };

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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addNewAddress = async (req, res) => {
    try {
        console.log("Received data:", req.body);
        console.log("Session user:", req.session.user);

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
        console.error('Error adding new address:', error);
        res.status(500).json({ success: false, message: 'Failed to add address' });
    }
}
 


const getCheckoutPage = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const addresses = await Address.find({ userId });
        const cart = await Cart.findOne({ userId }).populate('items.productId');

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
            couponApplied: req.session.appliedCoupon ? true : false
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error rendering checkout page');
    }
};

const handlePayment = async(req, res)=> {
    try {
        const { addressId, paymentType, totalCheckOutValue } = req.body;
        const userId = req.session.user._id;

        // Get cart details
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart) {
            return res.status(400).json({ error: 'Invalid cart.' });
        }

        // Get address details
        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(400).json({ error: 'Invalid address.' });
        }

        const totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        const finalAmount = totalCheckOutValue || totalAmount;
        const discountAmount = totalCheckOutValue ? totalAmount - totalCheckOutValue : 0;

        let session;

        // Only create a Stripe session if Stripe is selected
        if (paymentType === 'Stripe Payment') {
            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: cart.items.map(item => ({
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: item.productId.name,
                        },
                        unit_amount: item.price * 100, // Convert to paise
                    },
                    quantity: item.quantity,
                })),
                success_url: `${req.protocol}://${req.get('host')}/order-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.protocol}://${req.get('host')}/checkout`,
                metadata: {
                    cartId: cart._id.toString(),
                    userId: userId.toString(),
                    addressId: address._id.toString(),
                },
            });
        }

        // Create order in the database
        const order = new Order({
            userId,
            shippingAddress: address._id,
            items: cart.items.map(item => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.price,
            })),
            totalAmount,
            totalPrice: finalAmount,
            discountAmount,
            paymentMethod: paymentType,
            paymentIntentId: session ? session.id : null,
            stripeSessionId: session ? session.id : null,
        });

        await order.save();

        // Clear the user's cart after order creation
        await Cart.deleteOne({ userId });

        // Respond with the session URL for Stripe payment or success message
        if (session) {
            return res.status(200).json({ url: session.url });
        } else {
            return res.status(200).json({ message: 'Order placed successfully with Cash on Delivery' });
        }
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).json({ error: 'An error occurred while processing your payment.' });
    }
}

//GETING THE ORDERCONFIRMATION PAGE
const payment = async (req, res) => {
    try {
        const { session_id } = req.query;
        
        if (!session_id) {
            return res.status(400).json({ error: 'Session ID is required.' });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);
        console.log('Stripe Session:', session);

        // Find the order associated with the session
        const order = await Order.findOne({ stripeSessionId: session_id }).populate('items.product');
        console.log('Order:', order);

        if (!order) {
            return res.status(400).json({ error: 'Order not found.' });
        }

        if (session.payment_status === 'paid') {
            order.status = 'processing';  // Use lowercase 'processing'

            // Deduct stock for the ordered items if not done yet
            if (!order.stockUpdated) {
                for (const item of order.items) {
                    const product = await Product.findById(item.product._id);
                    if (!product) {
                        console.error(`Product not found: ${item.product._id}`);
                        return res.status(404).json({ error: 'Product not found.' });
                    }
                    product.stock -= item.quantity;
                    await product.save();
                }
                order.stockUpdated = true;
            }
        } else {
            order.status = 'canceled';  // Use lowercase 'canceled'
        }

        await order.save();

        // Render the order confirmation page with order details
        res.render('user/order-success', {
            message: session.payment_status === 'paid' ? 'Your order has been successfully placed!' : 'Your order could not be processed.',
            order: order
        });
    } catch (error) {
        console.error('Error confirming order payment:', error);
        res.status(500).json({ error: 'An error occurred while confirming your order.' });
    }
};
const orderPage = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const orders = await Order.find({ userId }).populate('items.product').exec();
        const user = await User.findById(userId).exec(); 
        res.render('user/userProfile', { orders ,user});
    } catch (err) {
        console.log(err);
        res.status(500).send('Error rendering page');
    }
};












  
  
  

module.exports = { home,userRegister, userRegistration, verifyOTP, loginUser, loginPage, logout,productdetail,shop,showCart,addToCart,removeCart,updateCartQuantity,getCheckoutPage,userEdit,applyCoupon,addNewAddress,payment,handlePayment,orderPage};
