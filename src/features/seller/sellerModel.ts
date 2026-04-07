import mongoose, { Schema, Document, Model } from "mongoose";


export interface ISellerProfile  {
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
    { timestamps: true,
        versionKey: false
     }
);

export const SellerProfile = mongoose.model<ISellerProfile>("SellerProfile", sellerSchema);
