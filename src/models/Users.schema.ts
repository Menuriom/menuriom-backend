import { Document, Schema, Types } from "mongoose";
export type UserDocument = User & Document;

export const UserSchema = new Schema({
    avatar: { type: String },
    name: { type: String },
    family: { type: String },

    email: { type: String, lowercase: true },
    emailInVerfication: { type: String, lowercase: true },
    emailVerifiedAt: { type: Date },
    emailVerificationCode: { type: String },
    emailVerficationCodeSentAt: { type: Date },

    mobile: { type: String },
    mobileInVerfication: { type: String, lowercase: true },
    mobileVerifiedAt: { type: Date },
    mobileVerificationCode: { type: String },
    mobileVerficationCodeSentAt: { type: Date },

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
        enum: ["active", "inactive", "banned"],
        default: "inactive",
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface User {
    _id: Types.ObjectId;
    avatar?: string;
    name?: string;
    family?: string;

    email: string;
    emailInVerfication?: string;
    emailVerifiedAt?: Date;
    emailVerificationCode?: string;
    emailVerficationCodeSentAt?: Date;

    mobile?: string;
    mobileInVerfication?: string;
    mobileVerifiedAt?: Date;
    mobileVerificationCode?: string;
    mobileVerficationCodeSentAt?: Date;

    googleId?: string;
    verficationCodeSentAt?: Date;

    role: "admin" | "user";
    status: "active" | "inactive" | "banned";
    createdAt: Date;
}
