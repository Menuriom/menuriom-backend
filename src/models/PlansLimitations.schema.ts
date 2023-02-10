import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
export type PlanLimitationDocument = PlanLimitation & Document;

export const PlanLimitationsSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
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

export interface PlanLimitation {
    _id: Schema.Types.ObjectId;
    name: string;
    description: string;
    createdAt: Date;
    translation: Translation;
}
