import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { Brand } from "./Brands.schema";
import { Branch } from "./Branches.schema";
export type MenuCategoryDocument = MenuCategory & Document;

export const MenuCategorySchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    branches: [{ type: Schema.Types.ObjectId, ref: "Branch" }],

    icon: { type: String },
    name: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },

    hidden: { type: Boolean, default: false },
    showAsNew: { type: Boolean, default: false },

    createdAt: { type: Date, default: new Date(Date.now()) },
    translation: TranslationSchema,
});

export interface MenuCategory {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;
    branches: PopulatedDoc<Branch[]>;

    icon?: string;
    name: string;
    description?: string;
    order: number;

    hidden: boolean;
    showAsNew: boolean;

    createdAt: Date;
    translation: Translation;
}
