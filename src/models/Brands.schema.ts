import { Document, Schema } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { BrandType } from "./BrandTypes.schema";
import { User } from "./Users.schema";
export type BrandDocument = Brand & Document;

export const BrandsSchema = new Schema({
    logo: { type: String },
    name: { type: String, required: true },
    type: { type: Schema.Types.ObjectId, ref: "BrandType" },
    slogan: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    socials: [new Schema({
        name: { type: String, required: true },
        link: { type: String, required: true },
    })],
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface Brand {
    _id: Schema.Types.ObjectId;
    logo?: string;
    name: string;
    brandType: BrandType | Schema.Types.ObjectId;
    slogan?: string;
    creator: User | Schema.Types.ObjectId;
    socials: Social[];
    createdAt: Date;
    translation: Translation;
}

export interface Social {
    name: string;
    link: string;
}
