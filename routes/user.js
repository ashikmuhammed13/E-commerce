const router = require('express').Router();
const { home, userRegister, userRegistration, loginUser, loginPage, userEdit,logout, verifyOTP, productdetail,shop,addToCart,showCart,removeCart,updateCartQuantity,getCheckoutPage,applyCoupon,addNewAddress,handlePayment,payment,orderPage,returns,addToWishlist,getWishlist,removeWishlist,editUser,getPassword,forgetPassword,otpCheck,resetPassword,search} = require('../controller/usercontroller');
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
router.post("/returns",returns)
router.post("/addToWishlist",addToWishlist)
router.get('/removeWishlist', removeWishlist);
router.post("/editUser",editUser)
router.post("/forgetPassword",forgetPassword)
router.get("/getPassword",getPassword)
router.post("/otpCheck",otpCheck)
router.post("/resetPassword",resetPassword)

 

// User registration routes
router.get('/register', userRegister);
router.post('/register', userRegistration);
router.post('/verify-otp', verifyOTP);
router.get('/search', search);

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
router.get('/wishlist',getWishlist);

router.get('/contact', (req, res) => {
    res.render('user/about');
});

router.get('/logout', logout);


module.exports = router;

