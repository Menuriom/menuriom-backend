import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
export type AnalyticDocument = Analytic & Document;

export const AnalyticsSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brands", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branches", required: true },
    menu: { type: Schema.Types.ObjectId, ref: "Menues", required: true },
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
    name: string;
    address: string;
    telephoneNumber: string;
    postalCode: string;
    brand: Schema.Types.ObjectId;
    gallery?: string[];
    createdAt: Date;
    translation: Translation;
}
