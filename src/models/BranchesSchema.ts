import { Document, Schema } from "mongoose";
export type UserDocument = Branches & Document;

export const BranchesSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    telephoneNumber: { type: String, required: true },
    postalCode: { type: String, required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brands", required: true },
    gallery: [{ type: String }],
    createdAt: {
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

export interface Branches {
    _id: Schema.Types.ObjectId;
    name: string;
    address: string;
    telephoneNumber: string;
    postalCode: string;
    brand: Schema.Types.ObjectId;
    gallery?: string[];
    createdAt: Date;
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
