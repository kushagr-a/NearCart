import { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { User } from "./userModel";
import { config } from "../../db/config";
import logger from "../utils/logger/logger";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password, username, role } = req.body;

        // 1. Basic validation
        if (!email || !password || !username || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // normalize
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.trim();

        // 2. Check existing user
        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { username: normalizedUsername }
            ]
        }).select("+password");

        if (existingUser) {
            //  Email already exists
            if (existingUser.email === normalizedEmail) {
                return res.status(409).json({
                    success: false,
                    message: `This email is already registered as ${existingUser.role}`,
                    action: "LOGIN_INSTEAD"
                });
            }

            //  Username already taken
            if (existingUser.username === normalizedUsername) {
                return res.status(409).json({
                    success: false,
                    message: "Username already taken",
                });
            }
        }

        // 3. Hash password
        const hashedPassword = await argon2.hash(password);

        // 4. Create user
        const user = await User.create({
            email: normalizedEmail,
            password: hashedPassword,
            username: normalizedUsername,
            role,
        });

        // 5. Generate token (include role )
        const token = jwt.sign(
            {
                _id: user._id,
                role: user.role
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn as any }
        );

        // 6. Cookie setup (secure production ready)
        res.cookie("token", token, {
            maxAge: config.cookie.maxAge as number,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        // 7. Remove password safely
        // const userResponse = user.toObject();
        // delete userResponse.password;
        const { password: _, ...userResponse } = user.toObject();

        return res.status(201).json({
            success: true,
            message: "User registered successfully",

            user: userResponse,
            accessToken: token,

        });

    } catch (error: any) {
        logger.error("Register Error:", error);

        //  Mongo duplicate key error (extra safety)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Duplicate field error",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const login = async (req: Request, res: Response) => {
};

export const logout = async (req: Request, res: Response) => {
};

export const logoutAllDevice = async (req: Request, res: Response) => {
};

export const forgotPassword = async (req: Request, res: Response) => {
};

export const resetPassword = async (req: Request, res: Response) => {
};

export const changePassword = async (req: Request, res: Response) => {
};

export const me = async (req: Request, res: Response) => {
};

export const updateProfile = async (req: Request, res: Response) => {
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
};

export const deleteAccount = async (req: Request, res: Response) => {
};

