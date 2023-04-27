import { Document, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { BrandType } from "./BrandTypes.schema";
import { User } from "./Users.schema";
export type BrandDocument = Brand & Document;

export const BrandSchema = new Schema({
    logo: { type: String },
    name: { type: String, required: true },
    type: { type: Schema.Types.ObjectId, ref: "BrandType" },
    slogan: { type: String },
    branchSize: { type: Number, default: 1 },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    socials: [
        new Schema({
            name: { type: String, required: true },
            link: { type: String, required: true },
        }),
    ],
    languages: [{ type: String }],
    currency: { type: String, default: "Toman" },
    createdAt: { type: Date, default: new Date(Date.now()) },
    deletedAt: { type: Date },
    translation: TranslationSchema,
});

export interface Brand {
    _id: Types.ObjectId;
    logo?: string;
    name: string;
    brandType: BrandType | Types.ObjectId;
    slogan?: string;
    branchSize: number;
    creator: User | Types.ObjectId;
    socials: Social[];
    languages?: string[];
    currency: string;
    createdAt: Date;
    deletedAt?: Date;
    translation: Translation;
}

export interface Social {
    name: string;
    link: string;
}
