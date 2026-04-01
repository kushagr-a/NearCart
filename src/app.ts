import express from "express"
import cors from "cors"
import morgan from "morgan"


import { config } from "./db/config"
import logger from "./features/utils/logger/logger"

const app = express()

// Middleware
app.use(express.json({ limit: "50kb" }))
app.use(express.urlencoded({ extended: true, limit: "50kb" }))

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


app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the backend API and let's build something amazing together!",
        devlopment: config.env
    })
})


export default app
