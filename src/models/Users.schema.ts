import { Document, Schema } from "mongoose";
export type UserDocument = User & Document;

export const UsersSchema = new Schema({
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
    // brand: { type: Schema.Types.ObjectId, ref: "Tag" },
    // categories: new Schema({
    //     icon: { type: String, required: true },
    //     name: { type: String, required: true },
    // }),
    updatedAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: new Schema({
        ir: { type: Object },
        en: { type: Object },
        it: { type: Object },
        de: { type: Object },
        tr: { type: Object },
        jp: { type: Object },
        cn: { type: Object },
    }),
});

export interface User {
    _id: Schema.Types.ObjectId;
    avatar?: string;
    name?: string;
    family?: string;
    email: string;
    emailLoginCode: string;
    phoneNumber?: string;
    status?: string;
    createdAt: Date;
    updatedAt: Date;
    translation: {
        ir: unknown;
        en: unknown;
        it: unknown;
        de: unknown;
        tr: unknown;
        jp: unknown;
        cn: unknown;
    };
}
