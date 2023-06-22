import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { Brand } from "./Brands.schema";
export type MenuSideGroupDocument = MenuSideGroup & Document;

export const MenuSideGroupSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },

    name: { type: String, required: true },
    description: { type: String },
    items: [
        {
            name: { type: String, required: true },
            price: { type: Number, default: 0, required: true },
            translation: TranslationSchema,
        },
    ],
    maxNumberUserCanChoose: { type: Number, default: Infinity, required: true },

    createdAt: { type: Date, default: new Date(Date.now()) },
    translation: TranslationSchema,
});

export interface MenuSideGroup {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;

    name: string;
    description?: string;
    items: Array<{ name: string; price: number; translation: Translation }>;
    maxNumberUserCanChoose: number;

    createdAt: Date;
    translation: Translation;
}
