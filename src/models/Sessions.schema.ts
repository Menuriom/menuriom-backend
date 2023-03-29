import { Document, Schema } from "mongoose";
import { User } from "./Users.schema";
export type SessionDocument = Session & Document;

export const SessionsSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    userAgent: { type: String, required: true },
    ip: { type: String, required: true },
    accessTokenFamily: [{ type: String }],
    lastUsedToken: { type: String },
    currentlyInUseToken: { type: String, required: true },
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
    _id: Schema.Types.ObjectId;
    user: User | Schema.Types.ObjectId;
    userAgent: string;
    ip: string;
    accessTokenFamily: string[];
    lastUsedToken: string;
    currentlyInUseToken: string;
    expireAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
