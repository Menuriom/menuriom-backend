import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
import { BrandType } from "./BrandTypes.schema";
import { User } from "./users.schema";
export type BrandDocument = Brand & Document;

export const BrandsSchema = new Schema({
    brandType: { type: Schema.Types.ObjectId, ref: "BrandType" },

    logo: { type: String, required: true },
    name: { type: String, required: true },
    slogan: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    socials: [
        new Schema({
            name: { type: String, required: true },
            link: { type: String, required: true },
        }),
    ],
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

export interface Brand {
    _id: Schema.Types.ObjectId;
    brandType: BrandType | Schema.Types.ObjectId;
    logo: string;
    name: string;
    slogan: string;
    creator: User | Schema.Types.ObjectId;
    socials: Social[];
    createdAt: Date;
    translation: Translation;
}
export interface Social {
    name: string;
    link: string;
}
