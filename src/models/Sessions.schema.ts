import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { User } from "./Users.schema";
export type SessionDocument = Session & Document;

export const SessionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    userAgent: { type: String, required: true },
    ip: { type: String, required: true },
    accessTokenFamily: [{ type: String }],
    currentlyInUseToken: { type: String },
    status: {
        type: String,
        enum: ["active", "revoked", "ready-to-delete"],
        default: "active",
    },
    expireAt: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    updatedAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface Session {
    _id: Types.ObjectId;
    user: PopulatedDoc<User>;
    userAgent: string;
    ip: string;
    accessTokenFamily?: string[];
    currentlyInUseToken?: string;
    status: "active" | "revoked" | "ready-to-delete";
    expireAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
