import { Document, Schema } from "mongoose";
export type UserDocument = Brands & Document;

export const BrandsSchema = new Schema({
    brandType: { type: Schema.Types.ObjectId, ref: "BrandTypes" },

    logo: { type: String, required: true },
    name: { type: String, required: true },
    slogan: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "Users" },
    socials: new Schema({
        name: { type: String, required: true },
        link: { type: String, required: true },
    }),
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

export interface Brands {
    _id: Schema.Types.ObjectId;
    brandType: Schema.Types.ObjectId;
    logo: string;
    name: string;
    slogan: string;
    creator: Schema.Types.ObjectId;
    socials: string;
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
