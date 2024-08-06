const express = require('express');
const router = express.Router();
const upload = require('../helper/multer');
const { addProductPage, addProduct, user, products, banner, addBanner, addMidBanner, addBotBanner, addSaleBanner, bannershow, blockUser, unblockUser, blockProduct, unblockProduct, deleteProduct, userEdit,productEdit,searching } = require('../controller/admincontroller');

// Render admin pages
router.get('/login', (req, res) => res.render('admin/adminLogin'));
router.get('/add', addProductPage);
router.post('/addproducts', upload.array('imageUrls', 10), addProduct);
router.get('/profile', (req, res) => res.render('admin/admin'));
router.get('/coupon', (req, res) => res.render('admin/coupon'));
router.get('/bannerss', (req, res) => res.render('admin/bannershow'));
router.get('/order', (req, res) => res.render('admin/order'));
router.get('/products', products); // This should match your product listing route
router.get('/return', (req, res) => res.render('admin/return'));
router.get('/users', user);
router.get('/banners', banner);

// Add Banner
router.post('/banners', upload.fields([
    { name: 'bgimage', maxCount: 1 },
    { name: 'leftimg', maxCount: 1 },
    { name: 'rightimg', maxCount: 1 }
]), addBanner);

router.post('/midbanners', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
]), addMidBanner);

router.post('/botbanners', upload.fields([
    { name: 'bkimage', maxCount: 1 },
    { name: 'imglink1', maxCount: 1 },
    { name: 'imglink2', maxCount: 1 }
]), addBotBanner);

router.post('/salebanners', upload.single('saleimage'), addSaleBanner);

router.get('/bannershow', bannershow);

// Routes for blocking and unblocking users
router.get('/blockUser/:userId', blockUser);
router.get('/unblockUser/:userId', unblockUser);
router.get('/blockProduct/:productId', blockProduct);
router.get('/unblockProduct/:productId', unblockProduct);
router.get("/deleteProduct/:productId", deleteProduct);

// Route for editing a user
router.post("/editUser", (req, res, next) => {
    console.log("Received request to update user", req.query.id);
    next();
}, userEdit);
router.post('/editProduct', upload.array('imageUrls', 5), productEdit);
router.get("/searching",searching)
module.exports = router;
