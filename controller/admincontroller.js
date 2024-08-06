const { Banner, MidBanner, BotBanner, SaleBanner } = require('../models/banner');

const Product = require('../models/productSchema');
const { User, DeletedUser } = require('../models/userschema');
const addProductPage = (req, res) => {
    res.render('admin/addproducts');  // Ensure 'admin/addproducts' matches the path in the views folder
};

const addProduct = async (req, res) => {
    try {
        console.log(req.files, 'req.files', req.body, 'req.body');
        const { name, description, oldprice, category, price, countInStock } = req.body;
        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        }

        console.log('image urls', imageUrls);

        if (!name || !description || !oldprice || !price || imageUrls.length === 0 || !category || countInStock === undefined) {
            throw new Error("Missing required fields");
        }

        if (parseInt(countInStock) < 0) {
            throw new Error("Quantity must be 0 or above");
        }

        const newProduct = new Product({
            name,
            description,
            price: parseFloat(price),
            oldprice: parseFloat(oldprice),
            imageUrls,
            category,
            countInStock: parseInt(countInStock)
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
const bannershow = async (req, res) => {
    try {
        const topBanners = await Banner.find().lean();
        const midBanners = await MidBanner.find().lean();
        const botBanners = await BotBanner.find().lean();
        const saleBanners = await SaleBanner.find().lean();

        console.log({ topBanners, midBanners, botBanners, saleBanners }); // Log fetched data

        res.render('admin/bannershow', { topBanners, midBanners, botBanners, saleBanners });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
const banner = (req, res) => {
    // Fetch and display banners
    res.render('admin/banners');
};

// Handle add banner
const addBanner = async (req, res) => {
    const { maintext, bgtext, decollection } = req.body;
    const bgimage = req.files['bgimage'][0].filename;
    const leftimg = req.files['leftimg'][0].filename;
    const rightimg = req.files['rightimg'][0].filename;

    try {
        const newBanner = new Banner({
            bgimage,
            maintext,
            leftimg,
            rightimg,
            bgtext,
            decollection
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
    const image2 = req.files['image2'][0].filename;
    const image3 = req.files['image3'][0].filename;

    try {
        const newMidBanner = new MidBanner({
            image1,
            image2,
            image3
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
    const { title, price, dscrptext } = req.body;
    const bkimage = req.files['bkimage'][0].filename;
    const imglink1 = req.files['imglink1'][0].filename;
    const imglink2 = req.files['imglink2'][0].filename;

    try {
        const newBotBanner = new BotBanner({
            bkimage,
            title,
            price,
            dscrptext,
            imglink1,
            imglink2
        });
        await newBotBanner.save();
        res.render('admin/banners', { message: 'Bottom banner added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).render('admin/banners', { error: 'Server error' });
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
    const { userId } = req.params;
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








module.exports = {
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
    bannershow,
    deleteUser,
    unblockUser,
    blockProduct,
    unblockProduct,
    deleteProduct,
    productEdit,
    searching,

};