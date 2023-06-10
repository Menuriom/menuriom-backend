import { Document, Schema, Types, PopulatedDoc } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { Brand } from "./Brands.schema";
import { Plan } from "./Plans.schema";
export type BrandsPlanDocument = BrandsPlan & Document;

export const BrandsPlanSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    currentPlan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    period: { type: String, enum: ["monthly", "yearly"], default: "monthly", required: true },
    startTime: { type: Date, default: new Date(Date.now()) },
    nextInvoice: { type: Date },
    createdAt: { type: Date, default: new Date(Date.now()) },
    translation: TranslationSchema,
});

export interface BrandsPlan {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;
    currentPlan: PopulatedDoc<Plan>;
    period: "monthly" | "yearly";
    startTime: Date;
    nextInvoice?: Date;
    createdAt: Date;
    translation?: Translation;
}
