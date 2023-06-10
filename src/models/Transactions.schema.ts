import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { User } from "./Users.schema";
import { Plan } from "./Plans.schema";
import { Brand } from "./Brands.schema";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { Bill } from "./Bills.schema";
export type TransactionDocument = Transaction & Document;

export const TransactionSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    bill: { type: Schema.Types.ObjectId, ref: "Bill", required: true },

    user: { type: Schema.Types.ObjectId, ref: "User" },
    code: { type: String },
    method: { type: String, required: true },
    authority: { type: String, required: true },
    paidPrice: { type: Number, default: 0, required: true }, // In Toman
    status: { type: String, enum: ["pending", "ok", "canceled", "error"], default: "pending", required: true },
    error: { type: String },
    ip: { type: String },
    createdAt: { type: Date, default: new Date(Date.now()) },
});

export interface Transaction {
    _id: Types.ObjectId;
    
    brand: PopulatedDoc<Brand>;
    bill: PopulatedDoc<Bill>;

    user: PopulatedDoc<User>;
    code?: string;
    method: string;
    authority: string;
    paidPrice: number;
    status: "pending" | "ok" | "canceled" | "error";
    error?: string;
    ip?: string;
    createdAt: Date;
}
