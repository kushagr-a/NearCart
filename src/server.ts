import app from "./app"
import { config } from "./db/config";
import { connectDB, disconnectDB } from "./db/db";
import logger from "./features/utils/logger/logger";

const PORT = config.port

let server: any;

const startServer = async () => {
    try {
        // 1. Start the server
        server = app.listen(PORT, () => {
            logger.info(`Server running at http://localhost:${PORT}`);
            // console.log("Press Ctrl+C to stop");
        });

        // 2. Database connection should happen AFTER starting the listener
        await connectDB();

        // Graceful shutdown function
        const gracefulShutdown = (signal: string) => {
            logger.info(`\n${signal} received. Shutting down gracefully...`);

            if (server) {
                server.close(async () => {
                    logger.info("HTTP server closed");

                    // Close database connections here
                    await disconnectDB();
                    logger.info("Database connections closed");

                    process.exit(0);
                });
            } else {
                process.exit(0);
            }

            // Force close after 10 seconds
            setTimeout(() => {
                logger.error("Forced shutdown due to timeout");
                process.exit(1);
            }, 10000);
        };

        // Register shutdown handlers
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    } catch (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
};

// Handle global errors outside the startServer scope
process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

startServer();
