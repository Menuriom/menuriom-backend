import { Document, Schema, Types } from "mongoose";
export type ContactUsDocument = ContactUs & Document;

export const ContactUsSchema = new Schema({
    email: { type: String, lowercase: true, required: true },
    mobile: { type: String },
    name: { type: String, required: true },
    subject: {
        type: String,
        enum: ["request-feature", "report-issue", "sales"],
        required: true,
    },
    message: { type: String, required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface ContactUs {
    _id: Types.ObjectId;
    email: string;
    mobile?: string;
    name: string;
    subject: "request-feature" | "report-issue" | "sales";
    message: string;
    createdAt: Date;
}
