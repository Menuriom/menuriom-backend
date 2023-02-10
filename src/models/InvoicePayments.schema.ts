import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
export type InvoicePaymentDocument = InvoicePayment & Document;

export const InvoicePaymentsSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brands", required: true },
    brandPlan: { type: Schema.Types.ObjectId, ref: "BrandPlans", required: true },
    payedByUser: { type: Schema.Types.ObjectId, ref: "Users", required: true },
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
    brand: Schema.Types.ObjectId;
    brandPlan: Schema.Types.ObjectId;
    payedByUser: Schema.Types.ObjectId;
    authority: string;
    transactionCode: string;
    amount: number;
    date: Date;
    status: string;
    ipAddress: string;
    createdAt: Date;
    translation: Translation;
}
