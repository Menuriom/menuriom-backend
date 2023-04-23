import { Document, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { PlanLimitation } from "./PlansLimitations.schema";
export type PlanDocument = Plan & Document;

export const PlanSchema = new Schema({
    name: { type: String, required: true },
    limitations: [{ type: Schema.Types.ObjectId, ref: "PlanLimitation", required: true }],
    monthlyPrice: { type: Number, default: 0, required: true }, // in toman
    halfYearPrice: { type: Number, default: 0, required: true }, // in toman
    yearlyPrice: { type: Number, default: 0, required: true }, // in toman
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface Plan {
    _id: Types.ObjectId;
    name: string;
    limitations: Array<PlanLimitation | Types.ObjectId>;
    monthlyPrice: number;
    halfYearPrice: number;
    yearlyPrice: number;
    createdAt: Date;
    translation: Translation;
}
