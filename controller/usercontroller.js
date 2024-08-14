const { User } = require("../models/userschema");
const mongoose = require('mongoose')
const bcrypt = require("bcrypt");
const { generateOTP, sendOTP } = require('../utils/otp');
const {Product,Brand}=require("../models/productSchema")
const { Banner } = require('../models/banner');
const Cart=require("../models/cart")

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
const showCart = async (req, res) => {
    try {
        let cartItems = [];

        if (req.user) {
            // User is logged in, fetch the cart from the database
            const userId = req.user._id;
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
                    countinstock: item.countinstock,
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

const miniCart = async (req, res) => {
    try {
        let userCart = [];

        if (req.user) {
            const userId = req.user._id;
            const userProduct = await Cart.findOne({ user: userId }).populate("items.productId");

            if (!userProduct || userProduct.items.length === 0) {
                return res.status(404).render('user/cart', { errorMessage: 'Your cart is empty' });
            }

            userCart = userProduct.items;
        } else {
            const guestCart = req.session.cart || { items: [] };

            if (guestCart.items.length === 0) {
                return res.status(404).render('user/cart', { errorMessage: 'Your cart is empty' });
            }

            const productIds = guestCart.items.map(item => item.productId);
            const productsInCart = await Product.find({ _id: { $in: productIds } });

            const guestCartItems = guestCart.items.map(item => {
                const product = productsInCart.find(p => p._id.toString() === item.productId.toString());
                return {
                    ...item,
                    product: product
                };
            });

            userCart = guestCartItems;
        }

        console.log(userCart); // Add this line to inspect the cart data

        res.render('user/cart', {
            items: userCart,
            subtotal: userCart.reduce((total, item) => total + item.totalPrice, 0)
        });
    } catch (error) {
        console.error('Error displaying mini cart:', error);
        res.status(500).send('Internal server error');
    }
};




//ADDING TO CART
const cart = async (req, res) => {
    try {
        const { q: productId } = req.query;

        if (!productId) {
            return res.status(400).send('No product ID provided');
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        if (req.user) {
            // User is logged in, handle user cart
            const userId = req.user._id;
            let cart = await Cart.findOne({ userId });

            if (cart) {
                const productInCart = cart.items.find(item => item.productId.toString() === productId);

                if (productInCart) {
                    // Update the existing product in the cart
                    await Cart.updateOne(
                        { userId, "items.productId": productId },
                        {
                            $inc: { "items.$.countinstock": 1, "items.$.totalPrice": product.price }
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
                                    countinstock: 1
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
                        countinstock: 1
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
                productInCart.countinstock += 1;
                productInCart.totalPrice += product.price;
            } else {
                // Add a new product to the cart
                guestCart.items.push({
                    productId: product._id.toString(),
                    price: product.price,
                    totalPrice: product.price,
                    countinstock: 1
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
//REMOVING CART PRODUCT
const removeCart = async (req, res) => {
    const { productId } = req.params;
    try {
        const userId = req.user ? req.user._id : null;
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


  
module.exports = { home,userRegister, userRegistration, verifyOTP, loginUser, loginPage, logout,productdetail,shop,showCart,cart,removeCart};
