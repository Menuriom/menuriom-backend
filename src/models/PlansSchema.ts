import { Document, Schema } from "mongoose";
export type UserDocument = Plans & Document;

export const PlansSchema = new Schema({
    name: { type: String, required: true },
    limitations: [{ type: Schema.Types.ObjectId, ref: "Limitations", required: true }],
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

export interface Plans {
    _id: Schema.Types.ObjectId;
    name: string;
    limitations: Schema.Types.ObjectId[];
    monthlyPrice: number;
    halfYearPice: number;
    yearlyPrice: number;
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
