import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
import { Brand } from "./Brands.schema";
import { Plan } from "./Plans.schema";
export type BrandPlanDocument = BrandPlan & Document;

export const BrandPlansSchema = new Schema({
    name: { type: String, required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    currentPlan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
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
    brand: Brand | Schema.Types.ObjectId;
    currentPlan: Plan | Schema.Types.ObjectId;
    startTime: Date;
    nextInvoice: string;
    createdAt: Date;
    translation: Translation;
}
