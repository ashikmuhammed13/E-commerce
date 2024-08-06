const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    bgimage: { type: String, required: true },
    maintext: { type: String, required: true },
    leftimg: { type: String, required: true },
    rightimg: { type: String, required: true },
    bgtext: { type: String, required: true },
    decollection: { type: String, required: true }
});

const midBannerSchema = new mongoose.Schema({
    image1: { type: String, required: true },
    image2: { type: String, required: true },
    image3: { type: String, required: true }
});

const botBannerSchema = new mongoose.Schema({
    bkimage: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: String, required: true },
    dscrptext: { type: String, required: true },
    imglink1: { type: String, required: true },
    imglink2: { type: String, required: true }
});

const saleBannerSchema = new mongoose.Schema({
    saleimage: { type: String, required: true }
});

const Banner = mongoose.model('Banner', bannerSchema);
const MidBanner = mongoose.model('MidBanner', midBannerSchema);
const BotBanner = mongoose.model('BotBanner', botBannerSchema);
const SaleBanner = mongoose.model('SaleBanner', saleBannerSchema);

module.exports = { Banner, MidBanner, BotBanner, SaleBanner };
