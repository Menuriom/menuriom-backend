import { Document, Schema } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
export type UserPermissionDocument = UserPermission & Document;

export const UserPermissionSchema = new Schema({
    _id: { type: String },
    label: { type: String, required: true },
    group: { type: String, required: true },
    groupLabel: { type: String, required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface UserPermission {
    _id: Schema.Types.ObjectId;
    label: string;
    group: string;
    groupLabel: string;
    createdAt: Date;
    translation: Translation;
}
