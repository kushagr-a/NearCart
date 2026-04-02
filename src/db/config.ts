import dotenv from "dotenv";
dotenv.config();

import dns from "node:dns";

// DNS configuration
if (process.env.NODE_ENV === "development") {
    dns.setServers([
        '1.1.1.1', // Cloudflare DNS
        '8.8.8.8', // Google DNS
    ]);
}

export const config = {
    // port configuration + db configuration
    port: process.env.PORT || "3000",
    db: {
        url: process.env.DB_URL || "",
        options: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    },

    // cors configuration
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        exposedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        optionsSuccessStatus: 200,
    },

    // environment configuration
    env: process.env.NODE_ENV || "development",

    // cookie configuration
    cookie: {
        secret: process.env.COOKIE_SECRET || "MyCookieSecret",
        maxAge: 900000,
        httpOnly: true,
        secure: false,
        sameSite: "strict",
    },

    // jwt configuration
    jwt: {
        secret: process.env.JWT_SECRET || "MySecretKey",
        expiresIn: process.env.JWT_EXPIRES_IN || "3d", // 3 days
    },

    // cloudinary configuration
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
        api_key: process.env.CLOUDINARY_API_KEY || "",
        api_secret: process.env.CLOUDINARY_API_SECRET || "",
    }

}