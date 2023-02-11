import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
import { PlanLimitation } from "./PlansLimitations.schema";
export type PlanDocument = Plan & Document;

export const PlansSchema = new Schema({
    name: { type: String, required: true },
    limitations: [{ type: Schema.Types.ObjectId, ref: "PlanLimitation", required: true }],
    monthlyPrice: { type: Number, required: true },
    halfYearPice: { type: Number, required: true },
    yearlyPrice: { type: Number, required: true },
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

export interface Plan {
    _id: Schema.Types.ObjectId;
    name: string;
    limitations: PlanLimitation | Schema.Types.ObjectId[];
    monthlyPrice: number;
    halfYearPice: number;
    yearlyPrice: number;
    createdAt: Date;
    translation: Translation;
}
