import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { BranchMenu } from "./BranchMenus.schema";
export type MenuItemDocument = MenuItem & Document;

export const MenuItemSchema = new Schema({
    menu: { type: Schema.Types.ObjectId, ref: "BranchMenu", required: true },
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
    _id: Types.ObjectId;
    menu: PopulatedDoc<BranchMenu>;
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
