import express from "express"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"

import { config } from "./db/config"
import logger from "./features/utils/logger/logger"
import apiRoutes from "./apiRoutes"

const app = express()

// Middleware
app.use(express.json({ limit: "50kb" }))
app.use(express.urlencoded({ extended: true, limit: "50kb" }))
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


app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the backend API and let's build something amazing together!",
        devlopment: config.env
    })
})


export default app
