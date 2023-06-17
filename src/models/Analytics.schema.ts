import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Branch } from "./Branches.schema";
import { Brand } from "./Brands.schema";
export type AnalyticDocument = Analytic & Document;

export const AnalyticSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
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
    _id: Types.ObjectId;
    brand?: PopulatedDoc<Brand>;
    branch?: PopulatedDoc<Branch>;
    name: "QrScans" | "orders" | "likes";
    forGroup: "total" | "brand" | "branch" | "menu";
    type: "daily" | "monthly";
    count: number;
    date: Date;
    createdAt: Date;
}
