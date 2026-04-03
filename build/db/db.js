"use strict";
// import mongoose, { mongo } from "mongoose";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
// import { config } from "./config";
// export const connectDB = async () => {
//     try {
//         mongoose.connection.on("connected", () => {
//             try {
//                 const url = new URL(config.db.url);
//                 console.log(`MongoDB connected successfully to ${url.hostname}`);
//             } catch (e) {
//                 console.log(`MongoDB connected successfully`);
//             }
//         });
//         mongoose.connection.on("error", (err) => {
//             console.error(`MongoDB connection error: ${err}`);
//         });
//         await mongoose.connect(config.db.url, config.db.options);
//     } catch (error: any) {
//         console.error("MongoDB connection error:", error);
//         process.exit(1);
//     }
// };
// export const disconnectDB = async () => {
//     try {
//         await mongoose.disconnect();
//     } catch (error: any) {
//         console.error("MongoDB disconnection error:", error);
//         process.exit(1);
//     }
// }
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const logger_1 = __importDefault(require("../features/utils/logger/logger"));
/**
 * Utility to safely log the DB host without exposing credentials
 */
const getSafeDbUrl = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.hostname;
    }
    catch {
        return "Database";
    }
};
const connectDB = async () => {
    // 1. Setup Event Listeners before connecting
    mongoose_1.default.connection.on("connected", () => {
        const host = getSafeDbUrl(config_1.config.db.url);
        logger_1.default.info(`[Database] Connected successfully to ${host}`);
    });
    mongoose_1.default.connection.on("error", (err) => {
        logger_1.default.error(`[Database] Connection error: ${err.message}`);
    });
    mongoose_1.default.connection.on("disconnected", () => {
        logger_1.default.warn("[Database] Connection lost");
    });
    // 2. Execute Connection
    try {
        await mongoose_1.default.connect(config_1.config.db.url, config_1.config.db.options);
    }
    catch (error) {
        logger_1.default.error("[Database] Initial connection failed:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        logger_1.default.info("[Database] Disconnected gracefully");
    }
    catch (error) {
        logger_1.default.error("[Database] Disconnection error:", error);
        throw error;
    }
};
exports.disconnectDB = disconnectDB;
