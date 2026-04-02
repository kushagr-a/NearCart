import { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { User } from "./userModel";
import { config } from "../../db/config";


export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password, username, role } = req.body

        if (!email || !password || !username || !role) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const isUserExist = await User.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        })

        if (isUserExist) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await argon2.hash(password);

        const user = await User.create({
            email: email,
            password: hashedPassword,
            username: username,
            role: role
        });

        // token generation 
        const token = jwt.sign(
            { _id: user._id },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn as any },
        )

        // set token in cookie
        res.cookie("token", token, {
            maxAge: config.cookie.maxAge as number,
            httpOnly: config.cookie.httpOnly,
            secure: config.cookie.secure,
            sameSite: config.cookie.sameSite as "strict" | "lax" | "none"
        });

        user.password = undefined as unknown as string;

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user,
                accessToken: token,
            }
        });

    } catch (error: any) {
        console.error("Error registering user:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
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

