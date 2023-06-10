import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { User } from "./Users.schema";
import { Plan } from "./Plans.schema";
import { Brand } from "./Brands.schema";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
export type BillDocument = Bill & Document;

export const BillSchema = new Schema({
    billNumber: { type: Number, required: true },
    type: { type: String, enum: ["renewal", "planChange"], required: true },
    description: { type: String, required: true },

    creator: { type: Schema.Types.ObjectId, ref: "User" },
    creatorFullname: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },

    plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    planPeriod: { type: String, enum: ["monthly", "yearly"], required: true },
    payablePrice: { type: Number, required: true }, // In Toman
    status: { type: String, enum: ["notPaid", "pendingPayment", "paid", "canceled"], required: true },

    secondsAddedToInvoice: { type: Number, default: 0, required: true },

    transactions: [
        new Schema({
            user: { type: Schema.Types.ObjectId, ref: "User" },
            code: { type: String },
            method: { type: String, required: true },
            authority: { type: String, required: true },
            paidPrice: { type: Number, default: 0, required: true }, // In Toman
            status: { type: String, enum: ["pending", "ok", "canceled", "error"], default: "pending", required: true },
            error: { type: String },
            ip: { type: String },
            createdAt: { type: Date, default: new Date(Date.now()) },
        }),
    ],

    createdAt: { type: Date, default: new Date(Date.now()) },
    translation: TranslationSchema,
});

export interface Bill {
    _id: Types.ObjectId;
    billNumber: number;
    type: string;
    description: string;

    creator?: PopulatedDoc<User>;
    creatorFullname?: string;
    brand: PopulatedDoc<Brand>;

    plan: PopulatedDoc<Plan>;
    planPeriod: "monthly" | "yearly";
    payablePrice: number;
    status: "notPaid" | "pendingPayment" | "paid" | "canceled";

    secondsAddedToInvoice: number;

    transactions: Array<{
        _id: Types.ObjectId;
        user: PopulatedDoc<User>;
        code?: string;
        method: string;
        authority: string;
        paidPrice: number;
        status: "pending" | "ok" | "canceled" | "error";
        error?: string;
        ip?: string;
        createdAt: Date;
    }>;

    createdAt: Date;
    translation: Translation;
}
