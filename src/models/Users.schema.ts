import { Document, Schema } from "mongoose";
export type UserDocument = User & Document;

export const UsersSchema = new Schema({
    avatar: { type: String },
    name: { type: String },
    family: { type: String },

    email: { type: String, lowercase: true },
    emailVerifiedAt: { type: Date },
    emailVerificationCode: { type: String },

    mobile: { type: String },
    mobileVerifiedAt: { type: Date },
    mobileVerificationCode: { type: String },

    googleId: { type: String },
    verficationCodeSentAt: { type: Date },

    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "deactive", "banned"],
        default: "deactive",
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

export interface User {
    _id: Schema.Types.ObjectId;
    avatar?: string;
    name?: string;
    family?: string;

    email: string;
    emailVerifiedAt?: Date;
    emailVerificationCode?: string;

    mobile?: string;
    mobileVerifiedAt?: Date;
    mobileVerificationCode?: string;

    googleId?: string;
    verficationCodeSentAt?: Date;

    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
