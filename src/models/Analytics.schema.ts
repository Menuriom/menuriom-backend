import { Document, Schema } from "mongoose";
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
        required: true,
    },
    type: {
        type: String,
        enum: ["daily", "monthly"],
        required: true,
    },
    count: { type: Number },
    date: { type: Date },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface Analytic {
    _id: Schema.Types.ObjectId;
    brand?: Brand | Schema.Types.ObjectId;
    branch?: Branch | Schema.Types.ObjectId;
    menu?: Menu | Schema.Types.ObjectId;
    name: "QrScans" | "orders" | "likes";
    forGroup: "total" | "brand" | "branch" | "menu";
    type: "daily" | "monthly";
    count: number;
    date: Date;
    createdAt: Date;
}
