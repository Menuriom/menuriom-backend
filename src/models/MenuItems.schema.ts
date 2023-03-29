import { Document, Schema } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { Menu } from "./Menus.schema";
export type MenuItemDocument = MenuItem & Document;

export const MenuItemsSchema = new Schema({
    menu: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
    category: { type: String, required: true },

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
    _id: Schema.Types.ObjectId;
    menu: Menu | Schema.Types.ObjectId;
    category: string;

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
