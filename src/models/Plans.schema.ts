import { Document, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { PlanLimitation } from "./PlansLimitations.schema";
export type PlanDocument = Plan & Document;

export const PlanSchema = new Schema({
    icon: { type: String, required: true },
    name: { type: String, required: true },
    desc: { type: String },
    limitations: [
        {
            limit: { type: String, ref: "PlanLimitation", required: true },
            value: { type: Schema.Types.Mixed, required: true },
            valueType: { type: String, enum: ["Number", "Boolean"], required: true },
        },
    ],
    listings: [{ type: String }],
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
    icon: string;
    name: string;
    desc?: string;
    limitations: Array<{
        limit: PlanLimitation | string;
        value: number | boolean;
        valueType: "Number" | "Boolean";
    }>;
    listings: string[];
    monthlyPrice: number;
    halfYearPrice: number;
    yearlyPrice: number;
    createdAt: Date;
    translation: Translation;
}
