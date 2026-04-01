// import mongoose, { mongo } from "mongoose";

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

import mongoose from "mongoose";

import { config } from "./config";
import logger from "../features/utils/logger/logger";

/**
 * Utility to safely log the DB host without exposing credentials
 */
const getSafeDbUrl = (url: string): string => {
    try {
        const parsed = new URL(url);
        return parsed.hostname;
    } catch {
        return "Database";
    }
};

export const connectDB = async (): Promise<void> => {
    // 1. Setup Event Listeners before connecting
    mongoose.connection.on("connected", () => {
        const host = getSafeDbUrl(config.db.url);
        logger.info(`[Database] Connected successfully to ${host}`);
    });

    mongoose.connection.on("error", (err) => {
        logger.error(`[Database] Connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
        logger.warn("[Database] Connection lost");
    });

    // 2. Execute Connection
    try {
        await mongoose.connect(config.db.url, config.db.options);
    } catch (error) {
        logger.error("[Database] Initial connection failed:", error);
        process.exit(1);
    }
};

export const disconnectDB = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        logger.info("[Database] Disconnected gracefully");
    } catch (error) {
        logger.error("[Database] Disconnection error:", error);
        throw error;
    }
};
