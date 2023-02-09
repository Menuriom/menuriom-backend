import { Document, Schema } from "mongoose";
export type UserDocument = Menues & Document;

export const MenuesSchema = new Schema({
    name: { type: String, required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branches", required: true },
    type: { type: String, required: true },
    categories: new Schema({
        icon: { type: String, required: true },
        name: { type: String, required: true },
    }),
    colors: new Schema({
        header: { type: String, required: true },
        HeaderText: { type: String, required: true },
    }),
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

export interface Menues {
    _id: Schema.Types.ObjectId;
    name: string;
    branch: Schema.Types.ObjectId;
    type: string;
    categories: object;
    colors: object;
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
