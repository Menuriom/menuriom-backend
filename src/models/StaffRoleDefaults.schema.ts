import { Document, Schema } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { StaffPermission } from "./StaffPermissions.schema";
export type StaffRoleDefaultDocument = StaffRoleDefault & Document;

export const StaffRoleDefaultSchema = new Schema({
    name: { type: String, required: true },
    permissions: [{ type: String }],
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface StaffRoleDefault {
    _id: Schema.Types.ObjectId;
    name: string;
    permissions?: StaffPermission[] | string[];
    createdAt: Date;
    translation: Translation;
}
