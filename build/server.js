"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./db/config");
const db_1 = require("./db/db");
const logger_1 = __importDefault(require("./features/utils/logger/logger"));
const PORT = config_1.config.port;
let server;
const startServer = async () => {
    try {
        // 1. Start the server
        server = app_1.default.listen(PORT, () => {
            logger_1.default.info(`Server running at http://localhost:${PORT}`);
            // console.log("Press Ctrl+C to stop");
        });
        // 2. Database connection should happen AFTER starting the listener
        await (0, db_1.connectDB)();
        // Graceful shutdown function
        const gracefulShutdown = (signal) => {
            logger_1.default.info(`\n${signal} received. Shutting down gracefully...`);
            if (server) {
                server.close(async () => {
                    logger_1.default.info("HTTP server closed");
                    // Close database connections here
                    await (0, db_1.disconnectDB)();
                    logger_1.default.info("Database connections closed");
                    process.exit(0);
                });
            }
            else {
                process.exit(0);
            }
            // Force close after 10 seconds
            setTimeout(() => {
                logger_1.default.error("Forced shutdown due to timeout");
                process.exit(1);
            }, 10000);
        };
        // Register shutdown handlers
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    }
    catch (error) {
        logger_1.default.error("Failed to start server:", error);
        process.exit(1);
    }
};
// Handle global errors outside the startServer scope
process.on("uncaughtException", (err) => {
    logger_1.default.error("Uncaught Exception:", err);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    logger_1.default.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
startServer();
