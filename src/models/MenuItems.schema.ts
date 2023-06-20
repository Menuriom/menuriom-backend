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
    price: { type: Number, default: 0, required: true }, // in toman
    discountPercentage: { type: Number, default: 0 }, // 0 - 100

    variants: [
        {
            name: { type: String, required: true },
            price: { type: Number, default: 0, required: true }, // in toman
            discountPercentage: { type: Number, default: 0 },
        },
    ],

    hidden: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    soldOut: { type: Boolean, default: false },
    showAsNew: { type: Boolean, default: false },
    specialOfTheDay: { type: String, enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] },

    tags: [{ type: String }],
    sideItems: [{ type: Schema.Types.ObjectId, ref: "MenuSideGroup" }],

    likes: { type: Number, default: 0, required: true },
    createdAt: { type: Date, default: new Date(Date.now()) },
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
    price: number;
    discountPercentage: number;

    variants: Array<{ name: string; price: number; discountPercentage: number }>;

    hidden: boolean;
    pinned: boolean;
    soldOut: boolean;
    showAsNew: boolean;
    specialOfTheDay: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

    tags: Array<string>;
    sideItems: PopulatedDoc<MenuCategory[]>;

    likes: number;
    createdAt: Date;
    translation: Translation;
}
