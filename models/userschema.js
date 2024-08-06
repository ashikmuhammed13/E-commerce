// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: [3, "Name can't be smaller than 3 characters"],
        maxlength: [64, "Name can't be greater than 64 characters"],
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        minlength: [7, "Email is too short"],
        maxlength: [128, "Email can't be greater than 128 characters"],
        required: [true, "Email is required"],
        lowercase: true,
        unique: true,
        trim: true,
    },
    phone: {
        type: Number,
        minlength: [8, "Minimum 8 characters"],
        maxlength: [11, "Maximum 11 characters"],
        required: [true, "Number is required"],
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verifytoken: {
        type: String,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
}, { timestamps: true });

// Save password
userSchema.pre("save", async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

const deletedUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "deleted",
    },
}, { timestamps: true });

const DeletedUser = mongoose.model("DeletedUser", deletedUserSchema);

module.exports = { User, DeletedUser };