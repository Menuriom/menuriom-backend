import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Brand } from "./Brands.schema";
import { BrandsPlan } from "./BrandsPlans.schema";
import { User } from "./Users.schema";
export type InvoicePaymentDocument = InvoicePayment & Document;

export const InvoicePaymentSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    brandsPlan: { type: Schema.Types.ObjectId, ref: "BrandsPlan", required: true },
    payedByUser: { type: Schema.Types.ObjectId, ref: "User", required: true },

    authority: { type: String, required: true },
    transactionCode: { type: String },
    amount: { type: Number, required: true },

    ipAddress: { type: String },
    status: {
        type: String,
        enum: ["ok", "cancel", "error"],
        default: "cancel",
    },
    date: {
        type: Date,
        default: new Date(Date.now()),
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface InvoicePayment {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;
    brandsPlan: PopulatedDoc<BrandsPlan>;
    payedByUser: PopulatedDoc<User>;

    authority: string;
    transactionCode?: string;
    amount: number;

    ipAddress?: string;
    status: "ok" | "cancel" | "error";
    date: Date;
    createdAt: Date;
}
