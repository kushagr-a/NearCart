"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const node_dns_1 = __importDefault(require("node:dns"));
const config_1 = require("./db/config");
const logger_1 = __importDefault(require("./features/utils/logger/logger"));
const apiRoutes_1 = __importDefault(require("./apiRoutes"));
// dns configuration
node_dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json({ limit: "50kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50kb" }));
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)(config_1.config.cookie.secret));
// CORS configuration
app.use((0, cors_1.default)(config_1.config.cors));
// HTTP request logger
app.use((0, morgan_1.default)((tokens, req, res) => {
    if (req.url === "/favicon.ico") {
        return null;
    }
    return `${tokens.method?.(req, res)} ${tokens.url?.(req, res)} ${tokens.status?.(req, res)}`;
}, {
    stream: {
        write: (message) => {
            logger_1.default.http(message.trim());
        },
    },
}));
app.use("/api", apiRoutes_1.default);
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the NearCart API.",
        development: config_1.config.env
    });
});
exports.default = app;
