import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
import { Menu } from "./Menus.schema";
import { Table } from "./Tables.schema";
export type OrderDocument = Order & Document;

export const OrdersSchema = new Schema({
    orderNumber: { type: Number, required: true },
    table: { type: Schema.Types.ObjectId, ref: "Table", required: true },
    list: [{ type: Schema.Types.ObjectId, ref: "Menu", required: true }],
    date: {
        type: Date,
        default: new Date(Date.now()),
    },
    status: {
        type: String,
    },
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

export interface Order {
    _id: Schema.Types.ObjectId;
    orderNumber: number;
    table: Table | Schema.Types.ObjectId;
    list: Menu | Schema.Types.ObjectId;
    link: string;
    menu: Schema.Types.ObjectId;
    createdAt: Date;
    translation: Translation;
}
