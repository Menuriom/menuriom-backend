import { Document, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { Brand } from "./Brands.schema";
export type BranchDocument = Branch & Document;

export const BranchSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    telephoneNumbers: [{ type: String }],
    postalCode: { type: String },
    gallery: [{ type: String }],
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface Branch {
    _id: Types.ObjectId;
    brand: Brand | Types.ObjectId;
    name: string;
    address: string;
    telephoneNumbers?: string[];
    postalCode?: string;
    gallery?: string[];
    createdAt: Date;
    translation: Translation;
}
