import mongoose, { Schema } from "mongoose";

// --- INTERFACES ---
export interface IUser {
    username: string;
    email: string;
    password: string;
    image?: string | null;
    role: "SELLER" | "BUYER";
    isProfileCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// --- SCHEMAS ---
const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            select: false   // 'select: false' hides password by default
        },
        image: {
            type: String,
            default: null
        },
        role: {
            type: String,
            enum: ["SELLER", "BUYER"],
            required: true
        },
        isProfileCompleted: {
            type: Boolean,
            default: false
        },
    },
    { versionKey: false, timestamps: true }
);

// --- MODELS (Named Exports) ---
export const User = mongoose.model<IUser>("User", userSchema);
