import { Document, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
export type PlanLimitationDocument = PlanLimitation & Document;

export const PlanLimitationSchema = new Schema({
    _id: { type: String },
    name: { type: String, required: true },
    description: { type: String },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface PlanLimitation {
    _id: string;
    name: string;
    description?: string;
    createdAt: Date;
    translation: Translation;
}
