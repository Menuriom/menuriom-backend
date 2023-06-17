import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { Brand } from "./Brands.schema";
import { Branch } from "./Branches.schema";
import { MenuCategory } from "./MenuCategories.schema";
export type MenuItemDocument = MenuItem & Document;

export const MenuItemSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    branches: [{ type: Schema.Types.ObjectId, ref: "BranchMenu", required: true }],
    category: { type: Schema.Types.ObjectId, ref: "MenuCategory", required: true },

    images: [{ type: String }],
    name: { type: String, required: true },
    description: { type: String },

    soldOut: { type: Boolean, default: false },
    specialItem: { type: Boolean, default: false },
    showAsNew: { type: Boolean, default: false },

    price: { type: Number, default: 0, required: true }, // in toman

    subItems: new Schema({
        name: { type: String, required: true },
        extraCost: { type: Number, default: 0, required: true }, // in toman
    }),
    likes: { type: Number, default: 0, required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface MenuItem {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;
    branches: PopulatedDoc<Branch[]>;
    category: PopulatedDoc<MenuCategory>;

    images: string[];
    name: string;
    description?: string;

    soldOut: boolean;
    specialItem: boolean;
    showAsNew: boolean;

    price: number;

    subItems: SubItem[];
    likes: number;
    createdAt: Date;
    translation: Translation;
}

export interface SubItem {
    name: string;
    extraCost: number;
}
