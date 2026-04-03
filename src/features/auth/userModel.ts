import mongoose, { Schema, Document, Model } from "mongoose";

// --- INTERFACES ---
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    image?: string | null;
    role: "SELLER" | "BUYER";
    isProfileCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBuyerProfile extends Document {
    userId: mongoose.Types.ObjectId;
    fname: string;
    lname: string;
    address: string;
    phone: string;
    state: string;
    city: string;
    pincode: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    location: {
        type: "Point";
        coordinates: [number, number]; // [lng, lat]
    };
    rangeInKm: 2 | 5 | 10;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISellerProfile extends Document {
    userId: mongoose.Types.ObjectId;
    fname: string;
    lname: string;
    shopName: string;
    shopAddress: string;
    phone: string;
    state: string;
    city: string;
    pincode: string;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    rangeInKm: 2 | 5 | 10;
    isVerified: boolean;
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

const buyerSchema = new Schema<IBuyerProfile>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        fname: String,
        lname: String,
        address: String,
        phone: String,
        state: String,
        city: String,
        pincode: String,
        gender: {
            type: String,
            enum: ["MALE", "FEMALE", "OTHER"]
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }, // [lng, lat]
        },
        rangeInKm: {
            type: Number,
            enum: [2, 5, 10],
            default: 10
        },
    },
    { timestamps: true }
);

const sellerSchema = new Schema<ISellerProfile>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        fname: String,
        lname: String,
        shopName: String,
        shopAddress: String,
        phone: String,
        state: String,
        city: String,
        pincode: String,
        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            },
        },
        rangeInKm: {
            type: Number,
            enum: [2, 5, 10],
            default: 10
        },
        isVerified: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

// --- MODELS (Named Exports) ---
export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export const BuyerProfile: Model<IBuyerProfile> = mongoose.model<IBuyerProfile>("BuyerProfile", buyerSchema);
export const SellerProfile: Model<ISellerProfile> = mongoose.model<ISellerProfile>("SellerProfile", sellerSchema);
