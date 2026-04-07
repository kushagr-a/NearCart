import mongoose, { Schema, Document, Model, mongo } from "mongoose";

export interface IBuyerProfile  {
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
    { timestamps: true, versionKey: false }
);

export const BuyerProfile = mongoose.model<IBuyerProfile>("BuyerProfile", buyerSchema)
