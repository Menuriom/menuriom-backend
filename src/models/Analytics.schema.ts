import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Branch } from "./Branches.schema";
import { Brand } from "./Brands.schema";
export type AnalyticDocument = Analytic & Document;

export const AnalyticSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch" },
    name: {
        type: String,
        enum: ["qrScans", "orders", "likes", "itemViews"],
        required: true,
    },
    type: {
        type: String,
        enum: ["daily", "monthly"],
        required: true,
    },
    uniqueCount: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    income: { type: Number, default: 0 }, // Tomans
    date: { type: String },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface Analytic {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;
    branch?: PopulatedDoc<Branch>;
    name: "qrScans" | "orders" | "likes" | "itemViews";
    type: "daily" | "monthly";
    uniqueCount?: number;
    count: number;
    income?: number;
    date: string;
    createdAt: Date;
}
