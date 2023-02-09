import { Document, Schema } from "mongoose";
export type UserDocument = BrandPlans & Document;

export const BrandPlansSchema = new Schema({
    name: { type: String, required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brands", required: true },
    currentPlan: { type: Schema.Types.ObjectId, ref: "Plans", required: true },
    startTime: {
        type: Date,
        default: new Date(Date.now()),
    },
    nextInvoice: {
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

export interface BrandPlans {
    _id: Schema.Types.ObjectId;
    name: string;
    brand: Schema.Types.ObjectId;
    currentPlan: Schema.Types.ObjectId;
    startTime: Date;
    nextInvoice: string;
    createdAt: Date;
    translation: {
        ir: unknown;
        en: unknown;
        it: unknown;
        de: unknown;
        tr: unknown;
        jp: unknown;
        cn: unknown;
    };
}
