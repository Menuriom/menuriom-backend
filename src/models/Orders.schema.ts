import { Document, Schema } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { SubItem } from "./MenuItems.schema";
import { Menu } from "./Menus.schema";
import { Table } from "./Tables.schema";
export type OrderDocument = Order & Document;

export const OrdersSchema = new Schema({
    orderNumber: { type: String, required: true },
    table: { type: Schema.Types.ObjectId, ref: "Table", required: true },
    list: [
        new Schema({
            menu: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
            name: { type: String, required: true },
            description: { type: String },
            price: { type: Number, default: 0, required: true }, // in toman
            subItems: new Schema({
                name: { type: String, required: true },
                extraCost: { type: Number, default: 0, required: true }, // in toman
            }),
        }),
    ],
    date: {
        type: Date,
        default: new Date(Date.now()),
    },
    status: {
        type: String,
        enum: ["newOrder", "preparing", "delivered", "canceled"],
        default: "",
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface Order {
    _id: Schema.Types.ObjectId;
    orderNumber: string;
    table: Table | Schema.Types.ObjectId;
    list: List;
    date: Date;
    status: "newOrder" | "preparing" | "delivered" | "canceled";
    createdAt: Date;
    translation: Translation;
}

export interface List {
    menu: Menu | Schema.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    subItems: SubItem;
}
