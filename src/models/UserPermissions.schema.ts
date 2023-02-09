import { Document, Schema } from "mongoose";
export type UserPermissionsDocument = UserPermissions & Document;

export const UserPermissionsSchema = new Schema({
    _id: {
        type: String,
    },
    label: { type: String, required: true },
    group: { type: String, required: true },
    groupLabel: { type: String, required: true },
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

export interface UserPermissions {
    _id: Schema.Types.ObjectId;
    label: string;
    group: string;
    groupLabel: string;
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
