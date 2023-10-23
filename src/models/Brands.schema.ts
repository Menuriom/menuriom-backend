import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { BrandType } from "./BrandTypes.schema";
import { User } from "./Users.schema";
export type BrandDocument = Brand & Document;

export const BrandSchema = new Schema({
    logo: { type: String },
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: Schema.Types.ObjectId, ref: "BrandType" },
    slogan: { type: String },
    branchSize: { type: Number, default: 1 },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    socials: {
        instagram: { type: String },
        twitter: { type: String },
        telegram: { type: String },
        whatsapp: { type: String },
    },
    languages: [{ type: String }],
    currency: { type: String, default: "تومان" },
    createdAt: { type: Date, default: new Date(Date.now()) },
    deletedAt: { type: Date },
    translation: TranslationSchema,
});

export interface Brand {
    _id: Types.ObjectId;
    logo?: string;
    username: string;
    name: string;
    brandType: PopulatedDoc<BrandType>;
    slogan?: string;
    branchSize: number;
    creator: PopulatedDoc<User>;
    socials?: {
        instagram?: string;
        twitter?: string;
        telegram?: string;
        whatsapp?: string;
    };
    languages?: string[];
    currency: string;
    createdAt: Date;
    deletedAt?: Date;
    translation: Translation;
}
