import { Document, Schema } from "mongoose";
export type UserDocument = Orders & Document;

export const OrdersSchema = new Schema({
    orderNumber: { type: Number, required: true },
    table: { type: Schema.Types.ObjectId, ref: "Tables", required: true },
    list: [{ type: Schema.Types.ObjectId, ref: "Menues", required: true }],
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

export interface Orders {
    _id: Schema.Types.ObjectId;
    image: string;
    link: string;
    menu: Schema.Types.ObjectId;
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
