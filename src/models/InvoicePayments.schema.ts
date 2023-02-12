import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
import { BrandPlan } from "./BrandPlans.schema";
import { Brand } from "./Brands.schema";
import { User } from "./users.schema";
export type InvoicePaymentDocument = InvoicePayment & Document;

export const InvoicePaymentsSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    brandPlan: { type: Schema.Types.ObjectId, ref: "BrandPlan", required: true },
    payedByUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authority: { type: String, required: true },
    transactionCode: { type: String, required: true },
    amount: { type: Number, required: true },
    date: {
        type: Date,
        default: new Date(Date.now()),
    },
    status: {
        type: String,
        enum: ["ok", "cancel", "error"],
    },
    ipAddress: {
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

export interface InvoicePayment {
    _id: Schema.Types.ObjectId;
    brand: Brand | Schema.Types.ObjectId;
    brandPlan: BrandPlan | Schema.Types.ObjectId;
    payedByUser: User | Schema.Types.ObjectId;
    authority: string;
    transactionCode: string;
    amount: number;
    date: Date;
    status: string;
    ipAddress: string;
    createdAt: Date;
    translation: Translation;
}
