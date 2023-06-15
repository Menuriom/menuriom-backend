import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { Brand } from "./Brands.schema";
export type MenuCategoryDocument = MenuCategory & Document;

export const MenuCategorySchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    icon: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },

    hidden: { type: Boolean, default: false },
    showAsNew: { type: Boolean, default: false },

    createdAt: { type: Date, default: new Date(Date.now()) },
    translation: TranslationSchema,
});

export interface MenuCategory {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;
    icon: string;
    name: string;
    description?: string;

    hidden: boolean;
    showAsNew: boolean;

    createdAt: Date;
    translation: Translation;
}
