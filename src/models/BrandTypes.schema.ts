import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
export type BrandTypeDocument = BrandType & Document;

export const BrandTypesSchema = new Schema({
    name: { type: String, required: true },
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

export interface BrandType {
    _id: Schema.Types.ObjectId;
    name: string;
    createdAt: Date;
    translation: Translation;
}
