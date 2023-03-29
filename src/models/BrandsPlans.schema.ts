import { Document, Schema } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { Brand } from "./Brands.schema";
import { Plan } from "./Plans.schema";
export type BrandsPlanDocument = BrandsPlan & Document;

export const BrandsPlansSchema = new Schema({
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
    translation: TranslationSchema,
});

export interface BrandsPlan {
    _id: Schema.Types.ObjectId;
    brand: Brand | Schema.Types.ObjectId;
    currentPlan: Plan | Schema.Types.ObjectId;
    startTime: Date;
    nextInvoice: Date;
    createdAt: Date;
    translation: Translation;
}
