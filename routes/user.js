const router = require('express').Router();
const { home, userRegister, userRegistration, loginUser, loginPage, userEdit,logout, verifyOTP, productdetail,shop,addToCart,showCart,removeCart,updateCartQuantity,getCheckoutPage,applyCoupon,addNewAddress,handlePayment,payment,orderPage} = require('../controller/usercontroller');
const {isAuth}=require("../middleware/userAuth")
const Cart=require("../models/cart")
const Coupon=require("../models/coupon")
router.get('/cart', addToCart);
// router.get("/getCart", isAuth, getCart);
router.get("/showCart",showCart)
router.get('/', home);
router.post('/updateCartQuantity',updateCartQuantity);
router.post('/order/processOrder', isAuth, handlePayment);

// router.post("/checkout",isAuth,orderPlace)
router.post('/add-address', addNewAddress);
router.get('/checkout', isAuth,getCheckoutPage);
router.post("/editUser", userEdit);
router.post('/apply-coupon', isAuth, applyCoupon);
router.get("/removeCart/:productId", removeCart);
router.get('/order-success', isAuth,payment)


// User registration routes
router.get('/register', userRegister);
router.post('/register', userRegistration);
router.post('/verify-otp', verifyOTP);

// User login routes

router.get('/login', loginPage);+
router.post('/login', loginUser);

// Product detail route
router.get('/productinfo', productdetail);


// Other user routes
router.get('/shop',shop)

router.get('/sale', (req, res) => {
    res.render('user/sale');
});
router.get('/profile', orderPage);
router.get('/wishlist', (req, res) => {
    res.render('user/wishlist');
});

router.get('/contact', (req, res) => {
    res.render('user/about');
});

router.get('/logout', logout);


module.exports = router;


// const router = require('express').Router();
// const { home, userRegister, userRegistration, loginUser, loginPage, logout, verifyOTP, productdetail,shop,addToCart,showCart,removeCart,updateCartQuantity,createAddress} = require('../controller/usercontroller');
// const {isAuth}=require("../middleware/userAuth")
// router.get('/cart', addToCart);
// // router.get("/getCart", isAuth, getCart);
// router.get("/showCart",showCart)
// router.get('/', home);
// router.post('/updateCartQuantity',updateCartQuantity);
// router.get('/checkout', isAuth, (req, res) => {
//     res.render('user/checkout');
// });

// router.post("/checkout",isAuth,createAddress)


// router.get("/removeCart/:productId", removeCart);


// // User registration routes
// router.get('/register', userRegister);
// router.post('/register', userRegistration);
// router.post('/verify-otp', verifyOTP);

// // User login routes

// router.get('/login', loginPage);+
// router.post('/login', loginUser);

// // Product detail route
// router.get('/productinfo', productdetail);


// // Other user routes
// router.get('/shop',shop)

// router.get('/sale', (req, res) => {
//     res.render('user/sale');
// });
// router.get('/wishlist', (req, res) => {
//     res.render('user/wishlist');
// });

// router.get('/contact', (req, res) => {
//     res.render('user/about');
// });

// router.get('/logout', logout);


// module.exports = router;
