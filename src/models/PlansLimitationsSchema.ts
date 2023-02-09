import { Document, Schema } from "mongoose";
export type UserDocument = PlanLimitations & Document;

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

export interface PlanLimitations {
    _id: Schema.Types.ObjectId;
    name: string;
    description: string;
    createdAt: Date;
    translation: {
        ir: unknown;
        en: unknown;
        it: unknown;
        de: unknown;
        tr: unknown;
        jp: unknown;
        cn: unknown;
    };
}
