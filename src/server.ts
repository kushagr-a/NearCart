import app from "./app"
import { config } from "./db/config";
import { connectDB, disconnectDB } from "./db/db";
import logger from "./features/utils/logger/logger";
import ws from "ws"

// import dns from "node:dns"


const PORT = config.port

let server: any;
let wss: ws.Server

const startServer = async () => {
    try {
        // 1.  Start the HTTP server
        server = app.listen(PORT, () => {
            logger.info(`Server running at http://localhost:${PORT}`);
            // console.log("Press Ctrl+C to stop");
        });


        // 2. Initialize WebSocket server by attaching it to the HTTP server
        wss = new ws.Server({ server })

        wss.on("connection", (socket, req) => {
            const ip = req.socket.remoteAddress;
            logger.info(`New Websocket  connection established from ${ip}`)

            socket.on("message", (data) => {
                const message = data.toString();
                logger.info(`Received message: ${message}`);

                socket.send(`server received: ${message}`)
            });

            socket.on("error", (error) => {
                logger.error(`Socket error: ${error.message}`);
            })

            socket.on("close", () => {
                logger.info("WebSocket Client disconnected");
            });

        })

        //  3. Database connection
        await connectDB();

        // Graceful shutdown function
        const gracefulShutdown = (signal: string) => {
            logger.info(`\n${signal} received. Shutting down gracefully...`);

            // Close WebSocket server
            if (wss) {
                wss.close(() => {
                    logger.info("WebSocket server closed");
                });
            }

            // Close HTTP server and DB connections
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
