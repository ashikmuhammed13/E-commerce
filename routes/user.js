const router = require('express').Router();
const { home, userRegister, userRegistration, loginUser, loginPage, logout, verifyOTP, productdetail,shop,cart,showCart } = require('../controller/usercontroller');

// Home page route
router.get('/', home);

// User registration routes
router.get('/register', userRegister);
router.post('/register', userRegistration);
router.post('/verify-otp', verifyOTP);

// User login routes

router.get('/login', loginPage);
router.post('/login', loginUser);

// Product detail route
router.get('/productinfo', productdetail);


// Other user routes
router.get('/shop',shop)

router.get('/sale', (req, res) => {
    res.render('user/sale');
});
router.get('/wishlist', (req, res) => {
    res.render('user/wishlist');
});
router.get('/checkout', (req, res) => {
    res.render('user/checkout');
});
router.get('/contact', (req, res) => {
    res.render('user/about');
});
router.get('/cart',cart );
router.get('/logout', logout);


module.exports = router;
