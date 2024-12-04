const { Banner, MidBanner, BotBanner, SaleBanner } = require('../models/banner');
const Order = require('../models/Order')
const {Product,Brand} = require('../models/productSchema');
const { User, DeletedUser } = require('../models/userschema');
const Coupon=require("../models/coupon")
const logger = require('../utils/logger');

const loginGet = (req, res) => {
    res.render('admin/adminLogin');
  };
  
  const loginPost = (req, res) => {
    const { username, password } = req.body;
  
    // Hardcoded credentials
    const adminUsername = 'ashique@admin';
    const adminPassword = '906652336';
  
    if (username === adminUsername && password === adminPassword) {
      // Store admin status in session
      req.session.isAdmin = true;
      res.redirect('/admin/admin');
    } else {
      res.render('admin/adminLogin', { error: 'Invalid username or password' });
    }
  };
const addProductPage = (req, res) => {
    res.render('admin/addproducts');  // Ensure 'admin/addproducts' matches the path in the views folder
};

const addProduct = async (req, res) => {
    try {
        const { name, description, oldprice, category, price, countInStock, brandName } = req.body;
        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        }

        let brand = await Brand.findOne({ name: brandName });
        if (!brand) {
            brand = new Brand({ name: brandName });
            await brand.save();
        }

        const newProduct = new Product({
            name,
            description,
            price: parseFloat(price),
            oldprice: parseFloat(oldprice),
            imageUrls,
            category,
            countInStock: parseInt(countInStock),
            brand: brand._id
        });

        await newProduct.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(400).render('admin/addproducts', { errorMessage: error.message || 'Error adding product' });
    }
};

const user = async (req, res) => {
    try {
        const allUsers = await User.find({isDeleted:false}).lean();
        res.render('admin/users', { users: allUsers });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const products = async (req, res) => {
    try {
        const allProducts = await Product.find().sort({ createdAt: -1 }).lean();
        res.render('admin/products', { product: allProducts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
const banner = async (req, res) => {
    try {
        const topBanners = await Banner.find().lean();
        const midBanners = await MidBanner.find().lean();
        const botBanners = await BotBanner.find().lean();
        const saleBanners = await SaleBanner.find().lean();

        console.log({ topBanners, midBanners, botBanners, saleBanners }); // Log fetched data

        res.render('admin/banners', { topBanners, midBanners, botBanners, saleBanners });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


// Handle add banner
const addBanner = async (req, res) => {
    const { maintext, bgtext, description } = req.body; // Extract 'description'
    const bgimage = req.files['bgimage'][0].filename;
    
    try {
        const newBanner = new Banner({
            bgimage,
            maintext,
            bgtext,
            description // Assign 'description'
        });
        await newBanner.save();
        res.render('admin/banners', { message: 'Banner added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).render('admin/banners', { error: 'Server error' });
    }
};


// Handle add mid banner
const addMidBanner = async (req, res) => {
    const image1 = req.files['image1'][0].filename;
    

    try {
        const newMidBanner = new MidBanner({
            image1
        });
        await newMidBanner.save();
        res.render('admin/banners', { message: 'Mid banner added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).render('admin/banners', { error: 'Server error' });
    }
};

// Handle add bottom banner
const addBotBanner = async (req, res) => {
    const { title, dscrptext } = req.body; // Removed 'price'
    
    // Ensure that the file was uploaded
    if (!req.files || !req.files['bkimage'] || req.files['bkimage'].length === 0) {
        return res.status(400).render('admin/banners', { error: 'Background image is required.' });
    }

    const bkimage = req.files['bkimage'][0].filename;

    try {
        const newBotBanner = new BotBanner({
            bkimage,
            title,
            dscrptext,
        });
        await newBotBanner.save();
        res.render('admin/banners', { message: 'Bottom banner added successfully' });
    } catch (error) {
        console.error('Error adding Bottom Banner:', error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).render('admin/banners', { error: messages.join('. ') });
        }

        // Handle other errors
        res.status(500).render('admin/banners', { error: 'Server error. Please try again later.' });
    }
};

// Handle add sale banner
const addSaleBanner = async (req, res) => {
    const saleimage = req.file.filename;

    try {
        const newSaleBanner = new SaleBanner({
            saleimage
        });
        await newSaleBanner.save();
        res.render('admin/banners', { message: 'Sale banner added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).render('admin/banners', { error: 'Server error' });
    }
};


const deleteUser = async (req, res) => {
    const { userId } = req.query;
    console.log('Deleting user with ID:', userId); // Debugging log

    try {
        // Find and update user to mark as deleted
        const user = await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });

        if (!user) {
            console.log('User not found');
            return res.status(404).send("User not found");
        }

        // Create a new DeletedUser record
        const deletedUser = new DeletedUser({
            username: user.username,
            email: user.email,
            status: "deleted"
        });

        await deletedUser.save();
        console.log('User marked as deleted and moved to DeletedUser collection');

        // Redirect to users list or any other page
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).render('admin/users', { error: 'Server error' });
    }
};

const blockUser = async (req, res) => {
    const { userId } = req.params;
    try {
        // Set isActive to false to block the user
        const blockedUser = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
        console.log('User blocked:', blockedUser);
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).render('admin/users', { error: 'Server error' });
    }
};

const unblockUser = async (req, res) => {
    const { userId } = req.params;
    try {
        // Set isActive to true to unblock the user
        const unblockedUser = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
        console.log('User unblocked:', unblockedUser);
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).render('admin/users', { error: 'Server error' });
    }
};

const blockProduct = async (req, res) => {
    const { productId } = req.params;
    try {
        const blockProducts = await Product.findByIdAndUpdate(productId, { isActive: false }, { new: true });
        res.redirect("/admin/products");
    } catch (error) {
        console.error(error);
        res.status(500).render('admin/products', { error: 'Server error' });
    }
};

const unblockProduct = async (req, res) => {
    const { productId } = req.params;
    try {
        const unblockProducts = await Product.findByIdAndUpdate(productId, { isActive: true }, { new: true });
        res.redirect("/admin/products");
    } catch (error) {
        console.error(error);
        res.status(500).render('admin/products', { error: 'Server error' });
    }
};
const deleteProduct = async (req, res) => {
    const { productId } = req.params;
    try {
        await Product.findByIdAndDelete(productId);  // Correct method to delete by ID
        res.redirect("/admin/products"); 
    } catch (error) {
        console.error(error);
        res.status(500).render('admin/products', { error: 'Server error' });
    }
};

const userEdit = async (req, res) => {
    const userId = req.query.id; // Fetch userId from query parameters
    const { username, email, phone } = req.body;

    console.log('Received userId:', userId);
    console.log('Received data:', req.body);

    try {
        const userEditing = await User.findByIdAndUpdate(userId, {
            username,
            email,
            phone,
        }, { new: true }); // 'new: true' returns the updated document

        if (!userEditing) {
            return res.status(404).send('User not found');
        }

        // Redirect back to the users page after updating
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Server error');
    }
};

const productEdit = async (req, res) => {
    const productId = req.query.id;
    try {
        const { name, brand, countInStock, price } = req.body;
        let updateData = { name, brand, countInStock, price };

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
            
            // Get the current product
            const currentProduct = await Product.findById(productId);
            
            // Combine new images with existing ones
            updateData.imageUrls = [...currentProduct.imageUrls, ...newImageUrls];
        }

        const productEdit = await Product.findByIdAndUpdate(productId, updateData, { new: true });

        res.redirect("/admin/products");
    } catch (error) {
        console.error(error);
        res.status(500).render('admin/products', { error: 'Server error' });
    }
};

  const searching = async (req, res) => {
    try {
        const word = req.query.word;
        const allUsers = await User.find({
            username: { $regex: `^${word}`, $options: 'i' }, role: 'user'
        }).lean();
        res.json(allUsers);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

const addCoupon = async (req, res) => {
    try {
        console.log("body:",req.body)
        const { code, discount, condition, minPriceRange, maxPriceRange, usageCount, expireDate } = req.body;

        // Assuming you have a Mongoose model named Coupon
        const newCoupon = new Coupon({
            code, // Use lowercase 'coupon' to avoid naming conflict
            discount,
            condition,
            minPriceRange,
            maxPriceRange,
            usageCount,
            expireDate
        });

        await newCoupon.save();
        res.render("admin/coupon", { message: "Coupon saved successfully." });
    } catch (error) {
        console.error(error);
        res.render("admin/coupon", { errorMessage: "Server error" }); // Adjusted error page rendering path
    }
};  

const showCoupon=async(req,res)=>{
    try{
        const coupons=await Coupon.find().lean()

        res.render("admin/coupon",{coupons})}
        catch (error) {
            console.error(error);
            res.render("admin/coupon", { errorMessage: "Server error" }); // Adjusted error page rendering path
        
    };  
}

const order=async(req,res)=>{
    try{
        const userOrders=await Order.find().populate("userId").exec()

        res.render("admin/order",{userOrders})
    }
    catch (error) {
        console.error(error);
        res.render("admin/order", { errorMessage: "Server error" }); // Adjusted error page rendering path
    
};  
}

const updateOrderStatus=async (req, res) => {
    console.log("entered")
    const { orderId, status } = req.body;
    console.log("orderId:",orderId)

    try {
        // Update the order status in the database
        const order = await Order.findByIdAndUpdate(orderId, { status: status }, { new: true });

        if (order) {
            return res.status(200).json({ success: true, message: 'Order status updated successfully.' });
        } else {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}
 
const returns = async (req, res) => {
    try {
        // Find orders where at least one item has the isReturn status as 'processing', 'refunded', or 'requested'
        const orders = await Order.find({
            "items.isReturn": { $in: ['processing', 'refunded', 'requested'] }
        }).lean();

        // Pass the orders to the Handlebars template
        res.render("admin/return", { orders });
    } catch (error) {
        console.error("Error fetching return orders:", error);
        res.status(500).send("Internal Server Error");
    }
};


const updateReturnStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        // Update the order status
        const order = await Order.findById(orderId).populate('userId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the status is refunded
        if (status === 'refunded') {
            // Update isReturn to 'refunded' in the order
            order.items.forEach(item => {
                item.isReturn = 'refunded';
            });
            await order.save();

            // Find the user associated with the order and update their wallet
            const user = order.userId;
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Add the refund amount to the user's wallet
            const refundAmount = order.totalAmount; // Or specify the refund amount based on your logic
            user.wallet += refundAmount;
            await user.save();
        }

        // Update the order status
        order.status = status;
        await order.save();

        return res.status(200).json({ message: 'Order status updated and refund processed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating return status' });
    }
};
const getDashboardData = async (req, res) => {
    try {
      // Fetch total orders
      const totalOrders = await Order.countDocuments();
      
      // Fetch total revenue
      const totalRevenue = await Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
      ]);
  
      // Fetch the number of customers
      const totalCustomers = await User.countDocuments({ isActive: true });
      
      // Fetch best-selling products (from the Order model)
      const bestSellingProducts = await Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }  // Display top 5 products
      ]);
  
      // Fetch product names for best-selling products
      const bestSellingProductsWithNames = await Promise.all(
        bestSellingProducts.map(async (product) => {
          const productDetails = await Product.findById(product._id).select('name');
          return {
            ...product,
            name: productDetails ? productDetails.name : 'Unknown Product',
          };
        })
      );
  
      // Render the dashboard view with the fetched data
      res.render('admin/dashboard', {
        totalOrders,
        totalRevenue: totalRevenue[0]?.totalRevenue || 0,
        totalCustomers,
        bestSellingProducts: bestSellingProductsWithNames
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching dashboard data');
    }
  };

module.exports = {
    loginGet,
    loginPost,
    userEdit,
    blockUser,
    addProductPage,
    addProduct,
    products,
    user,
    banner,
    addBanner,
    addMidBanner,
    addBotBanner,
    addSaleBanner,
    deleteUser,
    unblockUser,
    blockProduct,
    unblockProduct,
    deleteProduct,
    productEdit,
    searching,
    addCoupon,
    showCoupon,
    order,
    updateOrderStatus,
    returns,
    updateReturnStatus,
    getDashboardData
};