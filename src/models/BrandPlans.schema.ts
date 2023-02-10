import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
export type BrandPlanDocument = BrandPlan & Document;

export const BrandPlansSchema = new Schema({
    name: { type: String, required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brands", required: true },
    currentPlan: { type: Schema.Types.ObjectId, ref: "Plans", required: true },
    startTime: {
        type: Date,
        default: new Date(Date.now()),
    },
    nextInvoice: {
        type: Date,
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

export interface BrandPlan {
    _id: Schema.Types.ObjectId;
    name: string;
    brand: Schema.Types.ObjectId;
    currentPlan: Schema.Types.ObjectId;
    startTime: Date;
    nextInvoice: string;
    createdAt: Date;
    translation: Translation;
}
