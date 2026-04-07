"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.uploadProfilePicture = exports.updateProfile = exports.me = exports.changePassword = exports.forgotPassword = exports.logoutAllDevice = exports.logout = exports.login = exports.registerUser = void 0;
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("./userModel");
const config_1 = require("../../db/config");
const logger_1 = __importDefault(require("../utils/logger/logger"));
const registerUser = async (req, res) => {
    try {
        const { email, password, username, role } = req.body;
        // 1. Basic validation
        if (!email || !password || !username || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        // normalize
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.trim();
        // 2. Check existing user
        const existingUser = await userModel_1.User.findOne({
            $or: [
                { email: normalizedEmail },
                { username: normalizedUsername }
            ]
        }).select("+password");
        if (existingUser) {
            //  Email already exists
            if (existingUser.email === normalizedEmail) {
                return res.status(409).json({
                    success: false,
                    message: `This email is already registered as ${existingUser.role}`,
                    action: "LOGIN_INSTEAD"
                });
            }
            //  Username already taken
            if (existingUser.username === normalizedUsername) {
                return res.status(409).json({
                    success: false,
                    message: "Username already taken",
                });
            }
        }
        // 3. Hash password
        const hashedPassword = await argon2_1.default.hash(password);
        // 4. Create user
        const user = await userModel_1.User.create({
            email: normalizedEmail,
            password: hashedPassword,
            username: normalizedUsername,
            role,
        });
        // 5. Generate token (include role )
        const token = jsonwebtoken_1.default.sign({
            _id: user._id,
            role: user.role
        }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
        // 6. Cookie setup (secure production ready)
        res.cookie("token", token, {
            maxAge: config_1.config.cookie.maxAge,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        // 7. Remove password safely from response
        const userResponse = user.toObject();
        delete userResponse.password;
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: userResponse,
            accessToken: token,
        });
    }
    catch (error) {
        logger_1.default.error("Register Error:", error);
        //  Mongo duplicate key error (extra safety)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Duplicate field error",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.registerUser = registerUser;
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        // 1. Validation
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Identifier and password are required",
            });
        }
        const normalizedIdentifier = identifier.toLowerCase().trim();
        // 2. Detect email vs username
        const isEmail = normalizedIdentifier.includes("@");
        const query = isEmail
            ? { email: normalizedIdentifier }
            : { username: normalizedIdentifier };
        // 3. Find user
        const user = await userModel_1.User.findOne(query).select("+password");
        //  SECURITY: Don't reveal user existence
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // 4. Verify password
        const isMatch = await argon2_1.default.verify(user.password, password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // 5. Generate token (add more context)
        const token = jsonwebtoken_1.default.sign({
            _id: user._id,
            role: user.role,
        }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
        // 6. Set secure cookie
        res.cookie("token", token, {
            maxAge: config_1.config.cookie.maxAge,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        // 7. Remove password safely
        // const userObj = user.toObject();
        // delete userObj.password;
        const { password: _, ...userObj } = user.toObject();
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: userObj,
                accessToken: token,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Logout Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.logout = logout;
const logoutAllDevice = async (req, res) => {
    try {
        // Ensure user is authenticated (assuming middleware attached user to req)
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const userId = req.user._id;
        const result = await userModel_1.User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } }, // Increments tokenVersion, invalidating old tokens if middleware checks it
        { new: true });
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Clear the current cookie on this device
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        return res.status(200).json({
            success: true,
            message: "Successfully logged out from all devices. Please login again.",
        });
    }
    catch (error) {
        logger_1.default.error("Logout All Devices Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.logoutAllDevice = logoutAllDevice;
const forgotPassword = async (req, res) => {
    try {
        const { identifier, newPassword } = req.body;
        if (!identifier || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Identifier and new password are required",
            });
        }
        const normalizedIdentifier = identifier.toLowerCase().trim();
        const isEmail = normalizedIdentifier.includes("@");
        const query = isEmail
            ? { email: normalizedIdentifier }
            : { username: normalizedIdentifier };
        const user = await userModel_1.User.findOne(query).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const hashedPassword = await argon2_1.default.hash(newPassword);
        const updatedUser = await userModel_1.User.findOneAndUpdate(query, { password: hashedPassword }, { new: true });
        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        logger_1.default.error("Forgot Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.forgotPassword = forgotPassword;
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        // Ensure user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const userId = req.user._id;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old and new password are required",
            });
        }
        // Find the user with password field
        const user = await userModel_1.User.findById(userId).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Verify old password
        const isMatch = await argon2_1.default.verify(user.password, oldPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // Check if new password is same as old password
        const isSamePassword = await argon2_1.default.verify(user.password, newPassword);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different",
            });
        }
        const hashedPassword = await argon2_1.default.hash(newPassword);
        const updatedUser = await userModel_1.User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true, select: "-password" });
        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        logger_1.default.error("Change Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.changePassword = changePassword;
const me = async (req, res) => {
};
exports.me = me;
const updateProfile = async (req, res) => {
};
exports.updateProfile = updateProfile;
const uploadProfilePicture = async (req, res) => {
};
exports.uploadProfilePicture = uploadProfilePicture;
const deleteAccount = async (req, res) => {
};
exports.deleteAccount = deleteAccount;
