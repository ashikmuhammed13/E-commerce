const express = require('express');
const router = express.Router();
const upload = require('../helper/multer');
const {loginGet,loginPost,addProductPage, addProduct,deleteUser, user, products, banner, addBanner, addMidBanner, addBotBanner, addSaleBanner, blockUser, unblockUser, blockProduct, unblockProduct, deleteProduct, userEdit,productEdit,searching,addCoupon,showCoupon ,order,updateOrderStatus,returns,updateReturnStatus,getDashboardData} = require('../controller/admincontroller');
const {adminAuth}=require("../middleware/userAuth")
// Render admin pages
router.get('/login',loginGet);
router.post("/login",loginPost)
router.get("/admin", getDashboardData)
router.get('/add',adminAuth, addProductPage);
router.post('/addproducts', upload.array('imageUrls', 10), addProduct);
router.get('/profile', (req, res) => res.render('admin/admin'));
router.post("/addcoupon",addCoupon)
router.get("/coupon",adminAuth,showCoupon)

router.get('/order', order);
router.get('/products',adminAuth, products); // This should match your product listing route
router.get('/return',returns);
router.get('/users', user);
router.get('/banners', banner); 
router.post("/deleteUser",deleteUser) 
router.post("/updateOrderStatus",updateOrderStatus)
router.post("/updateReturnStatus",updateReturnStatus)

// Add Banner
router.post('/banners', upload.fields([
    { name: 'bgimage', maxCount: 1 },
]), addBanner);

router.post('/midbanners', upload.fields([
    { name: 'image1', maxCount: 1 }
]), addMidBanner);

router.post('/botbanners', upload.fields([
    { name: 'bkimage', maxCount: 1 }
]), addBotBanner);

router.post('/salebanners', upload.single('saleimage'), addSaleBanner);

// Routes for blocking and unblocking users
router.get('/blockUser/:userId',adminAuth, blockUser);
router.get('/unblockUser/:userId',adminAuth, unblockUser);
router.get('/blockProduct/:productId',adminAuth, blockProduct);
router.get('/unblockProduct/:productId',adminAuth, unblockProduct);
router.get("/deleteProduct/:productId",adminAuth, deleteProduct);

// Route for editing a user
router.post("/editUser", userEdit);
router.post('/editProduct', upload.array('imageUrls', 5), productEdit);
router.get("/searching",searching)
router.get('/bannerss', (req, res) => res.render('admin/zbannershow'));
module.exports = router;
