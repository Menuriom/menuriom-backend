import { Document, Schema, Types } from "mongoose";
export type UtknDocument = Utkn & Document;

export const UtknSchema = new Schema({
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    token: { type: String, required: true },
    status: {
        type: String,
        enum: ["active", "revoked"],
        default: "active",
    },
    expireAt: { type: Date, required: true },
    createdAt: { type: Date, default: new Date(Date.now()) },
});

export interface Utkn {
    _id: Types.ObjectId;
    ip: string;
    userAgent: string;
    token: string;
    status: "active" | "revoked";
    expireAt: Date;
    createdAt: Date;
}
