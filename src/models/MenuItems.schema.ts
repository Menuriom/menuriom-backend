import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
import { Menu } from "./Menus.schema";
export type MenuItemDocument = MenuItem & Document;

export const MenuItemsSchema = new Schema({
    menu: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Menu", required: true },

    images: [{ type: String }],
    name: { type: String, required: true },
    description: { type: String, required: true },
    soldOut: { type: Boolean, required: true },
    specialItem: { type: Boolean, required: true },
    showAsNew: { type: Boolean, required: true },
    price: { type: Number, required: true },
    subItems: new Schema({
        name: { type: String, required: true },
        extraCost: { type: String, required: true },
    }),
    likes: { type: Number, required: true },
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

export interface MenuItem {
    _id: Schema.Types.ObjectId;
    menu: Menu | Schema.Types.ObjectId;
    category: Menu | Schema.Types.ObjectId;
    images: string[];
    name: string;
    description: string;
    soldOut: boolean;
    specialItem: boolean;
    showAsNew: boolean;
    price: number;
    subItems: object;
    likes: number;
    createdAt: Date;
    translation: Translation;
}
