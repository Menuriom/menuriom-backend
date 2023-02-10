import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
export type QrCodeDocument = QrCode & Document;

export const QrCodesSchema = new Schema({
    image: { type: String, required: true },
    link: { type: String, required: true },
    menu: { type: Schema.Types.ObjectId, ref: "Menues", required: true },
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

export interface QrCode {
    _id: Schema.Types.ObjectId;
    image: string;
    link: string;
    menu: Schema.Types.ObjectId;
    createdAt: Date;
    translation: Translation;
}
