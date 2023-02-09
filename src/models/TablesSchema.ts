import { Document, Schema } from "mongoose";
export type UserDocument = Tables & Document;

export const TablesSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brands", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branches", required: true },
    qrCode: { type: Schema.Types.ObjectId, ref: "QrCodes", required: true },
    server: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    tableNumber: { type: Number, required: true },
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

export interface Tables {
    _id: Schema.Types.ObjectId;
    brand: Schema.Types.ObjectId;
    branch: Schema.Types.ObjectId;
    qrCode: Schema.Types.ObjectId;
    server: Schema.Types.ObjectId;
    tableNumber: number;
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
