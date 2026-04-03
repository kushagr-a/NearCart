"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../db/config");
const userModel_1 = require("./userModel");
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        const currentUser = await userModel_1.User.findById(decoded._id);
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        req.user = currentUser;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Invalid Token",
            });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "Token Expired",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};
exports.isAuthenticated = isAuthenticated;
