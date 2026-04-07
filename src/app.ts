import express from "express"
import cors from "cors"
import morgan from "morgan"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import dns from "node:dns"

import { config } from "./db/config"
import logger from "./features/utils/logger/logger"
import apiRoutes from "./apiRoutes"

// dns configuration
dns.setServers(["8.8.8.8", "1.1.1.1"])

const app = express()

// Middleware
app.use(express.json({ limit: "50kb" }))
app.use(express.urlencoded({ extended: true, limit: "50kb" }))
app.use(helmet())
app.use(cookieParser(config.cookie.secret as string))

// CORS configuration
app.use(cors(config.cors))

// HTTP request logger
app.use(
    morgan(
        (tokens, req, res) => {
            if (req.url === "/favicon.ico") {
                return null;
            }

            return `${tokens.method?.(req, res)} ${tokens.url?.(req, res)} ${tokens.status?.(req, res)}`;
        },
        {
            stream: {
                write: (message: string) => {
                    logger.http(message.trim());
                },
            },
        },
    ),
);

app.use("/api", apiRoutes);


app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the NearCart API.",
        development: config.env
    })
})


export default app
