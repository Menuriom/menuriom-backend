import { Document, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
export type PlanLimitationDocument = PlanLimitation & Document;

export const PlanLimitationSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface PlanLimitation {
    _id: Types.ObjectId;
    name: string;
    description: string;
    createdAt: Date;
    translation: Translation;
}
