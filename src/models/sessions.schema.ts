import { Document, Schema } from "mongoose";

export type SessionDocument = Session & Document;

export const SessionSchema = new Schema({
    avatar: { type: String },
    name: { type: String },
    family: { type: String },
    email: { type: String, required: true },
    emailLoginCode: { type: String, required: true },
    phoneNumber: { type: String },
    status: {
        type: String,
        enum: ["active", "disabled", "suspend"],
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    brand: { type: Schema.Types.ObjectId, ref: "Tag" },
    categories: new Schema({
        icon: { type: String, required: true },
        name: { type: String, required: true },
    }),
    updatedAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface Session {
    _id: Schema.Types.ObjectId;
    userAgent: string;
    ip: string;
    location?: string;
    expireAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
