import { Document, Schema } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
export type BrandTypeDocument = BrandType & Document;

export const BrandTypesSchema = new Schema({
    name: { type: String, required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface BrandType {
    _id: Schema.Types.ObjectId;
    name: string;
    createdAt: Date;
    translation: Translation;
}
