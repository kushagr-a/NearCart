import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger/logger";
import jwt from "jsonwebtoken";
import { config } from "../../db/config";
import { User } from "./userModel";

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const decoded = jwt.verify(
            token,
            config.jwt.secret
        ) as { _id: string };

        const currentUser = await User.findById(decoded._id );

        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        (req as any).user = currentUser;
        next();

    } catch (error: any) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Invalid Token",
            });
        }

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "Token Expired",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};
