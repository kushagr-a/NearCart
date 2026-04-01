import { error } from "node:console";
import winston from "winston";
import { config } from "../../../db/config";

// 1. Define log level
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}

// 2. Define level based on environment
const level = () => {
    const env = config.env || "development";
    const isDevelopment = env === "development";
    return isDevelopment ? "debug" : "warn";
}

// 3. Define colors
winston.addColors({
    error: "red",
    warn: "yellow",
    info: "white",
    http: "white",
    debug: "grey",
});

// 4. Customize format
const format = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.level}: ${info.message}`,
    ),
)

// 5. Define transports (where logs go)
const transport = [
    new winston.transports.Console(),
    new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
    }),
    new winston.transports.File({
        filename: "logs/all.log"
    })
];

// 6. Create the logger
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports: transport,
})

export default logger;
