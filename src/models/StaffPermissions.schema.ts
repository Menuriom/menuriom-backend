import { Document, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
export type StaffPermissionDocument = StaffPermission & Document;

export const StaffPermissionSchema = new Schema({
    _id: { type: String },
    label: { type: String, required: true },
    desc: { type: String },
    group: { type: String, required: true },
    groupLabel: { type: String, required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface StaffPermission {
    _id: string;
    label: string;
    desc?: string;
    group: string;
    groupLabel: string;
    createdAt: Date;
    translation: Translation;
}
