"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../../../db/config");
// 1. Define log level
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// 2. Define level based on environment
const level = () => {
    const env = config_1.config.env || "development";
    const isDevelopment = env === "development";
    return isDevelopment ? "debug" : "warn";
};
// 3. Define colors
winston_1.default.addColors({
    error: "red",
    warn: "yellow",
    info: "white",
    http: "white",
    debug: "grey",
});
// 4. Customize format
const format = winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.level}: ${info.message}`));
// 5. Define transports (where logs go)
const transport = [
    new winston_1.default.transports.Console(),
    new winston_1.default.transports.File({
        filename: "logs/error.log",
        level: "error",
    }),
    new winston_1.default.transports.File({
        filename: "logs/all.log"
    })
];
// 6. Create the logger
const logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format,
    transports: transport,
});
exports.default = logger;
