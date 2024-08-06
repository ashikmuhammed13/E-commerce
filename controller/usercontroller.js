const { User } = require("../models/userschema");
const mongoose = require('mongoose')
const bcrypt = require("bcrypt");
const { generateOTP, sendOTP } = require('../utils/otp');
const Product=require("../models/productSchema")
const { Banner } = require('../models/banner');

const home = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }).limit(25).exec();
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
        const shops = await Product.find().sort({ createdAt: -1 }).limit(25).exec(); // Fetch more than 12 to include best-selling products

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


const showCart = async (req, res) => {
    try {
        const { q: productId } = req.query; // Destructuring to get the productId
        console.log('Product ID received:', productId); // Debugging log

        if (!productId) {
            console.error('No product ID provided');
            return res.status(400).render('user/productdetail', { errorMessage: 'No product ID provided' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            console.error('Product not found');
            return res.status(404).render('user/productdetail', { errorMessage: 'Product not found' });
        }

        res.render('user/cart', { products: [product] });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).render('user/productdetail', { errorMessage: 'Failed to load product details' });
    }
};


const cart = async (req, res) => {
    try {
        const { q: productId } = req.query;
        console.log('Product ID received:', productId);

        if (!productId) {
            return res.status(400).send('No product ID provided');
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.render('user/cart', { products: [product] });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).send('Failed to load product details');
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
        console.log("User logged in successfully");
        res.redirect("/");
    } catch (err) {
        console.error("Login error:", err);
        req.flash("error", "Server error");
        res.redirect("/login");
    }
};

// Function to handle user logout
const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

module.exports = { home,userRegister, userRegistration, verifyOTP, loginUser, loginPage, logout,productdetail,shop,showCart,cart};
