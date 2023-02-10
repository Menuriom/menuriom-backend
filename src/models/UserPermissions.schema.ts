import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
export type UserPermissionDocument = UserPermission & Document;

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

export interface UserPermission {
    _id: Schema.Types.ObjectId;
    label: string;
    group: string;
    groupLabel: string;
    createdAt: Date;
    translation: Translation;
}
