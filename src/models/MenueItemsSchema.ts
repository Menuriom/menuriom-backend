import { Document, Schema } from "mongoose";
export type UserDocument = MenuesItems & Document;

export const MenuesItemsSchema = new Schema({
    menu: { type: Schema.Types.ObjectId, ref: "Menues", required: true },
    category: { type: String, required: true },
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

export interface MenuesItems {
    _id: Schema.Types.ObjectId;
    menu: Schema.Types.ObjectId;
    category: string;
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
