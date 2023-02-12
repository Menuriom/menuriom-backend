import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
import { Branch } from "./Branches.schema";
import { Brand } from "./Brands.schema";
import { Menu } from "./Menus.schema";
export type AnalyticDocument = Analytic & Document;

export const AnalyticsSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    menu: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
    name: {
        type: String,
        enum: ["QrScans", "orders", "likes"],
    },
    forGroup: {
        type: String,
        enum: ["total", "brand", "branch", "menu"],
    },
    type: {
        type: String,
        enum: ["daily", "monthly"],
    },
    count: { type: Number },
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

export interface Analytic {
    _id: Schema.Types.ObjectId;
    brand: Brand | Schema.Types.ObjectId;
    branch: Branch | Schema.Types.ObjectId;
    menu: Menu | Schema.Types.ObjectId;
    name: string;
    forGroup: string;
    type: string;
    count: number;
    createdAt: Date;
    translation: Translation;
}
