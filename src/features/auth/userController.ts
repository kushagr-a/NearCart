import { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { User, IUser } from "./userModel";
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

        // 7. Remove password safely from response
        const userResponse: any = user.toObject();
        delete userResponse.password;

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
    try {
        const { identifier, password } = req.body;

        // 1. Validation
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Identifier and password are required",
            });
        }

        const normalizedIdentifier = identifier.toLowerCase().trim();

        // 2. Detect email vs username
        const isEmail = normalizedIdentifier.includes("@");

        const query = isEmail
            ? { email: normalizedIdentifier }
            : { username: normalizedIdentifier };

        // 3. Find user
        const user = await User.findOne(query).select("+password");

        //  SECURITY: Don't reveal user existence
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // 4. Verify password
        const isMatch = await argon2.verify(user.password, password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // 5. Generate token (add more context)
        const token = jwt.sign(
            {
                _id: user._id,
                role: user.role,
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn as any }
        );

        // 6. Set secure cookie
        res.cookie("token", token, {
            maxAge: config.cookie.maxAge as number,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        // 7. Remove password safely
        // const userObj = user.toObject();
        // delete userObj.password;

        const { password: _, ...userObj } = user.toObject();

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: userObj,
                accessToken: token,
            },
        });

    } catch (error: any) {
        logger.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });

    } catch (error: any) {
        logger.error("Logout Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const logoutAllDevice = async (req: Request, res: Response) => {
    try {
        // Ensure user is authenticated (assuming middleware attached user to req)
        if (!(req as any).user || !(req as any).user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const userId = (req as any).user._id;

        const result = await User.findByIdAndUpdate(
            userId,
            { $inc: { tokenVersion: 1 } }, // Increments tokenVersion, invalidating old tokens if middleware checks it
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Clear the current cookie on this device
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Successfully logged out from all devices. Please login again.",
        });

    } catch (error: any) {
        logger.error("Logout All Devices Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { identifier, newPassword } = req.body;

        if (!identifier || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Identifier and new password are required",
            });
        }

        const normalizedIdentifier = identifier.toLowerCase().trim();
        const isEmail = normalizedIdentifier.includes("@");

        const query = isEmail
            ? { email: normalizedIdentifier }
            : { username: normalizedIdentifier };

        const user = await User.findOne(query).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const hashedPassword = await argon2.hash(newPassword);

        const updatedUser = await User.findOneAndUpdate(
            query,
            { password: hashedPassword },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
            data: updatedUser,
        });

    } catch (error: any) {
        logger.error("Forgot Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Ensure user is authenticated
        if (!(req as any).user || !(req as any).user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const userId = (req as any).user._id;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old and new password are required",
            });
        }

        // Find the user with password field
        const user = await User.findById(userId).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Verify old password
        const isMatch = await argon2.verify(user.password, oldPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Check if new password is same as old password
        const isSamePassword = await argon2.verify(user.password, newPassword);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different",
            });
        }

        const hashedPassword = await argon2.hash(newPassword);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true, select: "-password" }
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
            data: updatedUser,
        });
    } catch (error: any) {
        logger.error("Change Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const me = async (req: Request, res: Response) => {
};

export const updateProfile = async (req: Request, res: Response) => {
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
};

export const deleteAccount = async (req: Request, res: Response) => {
};

