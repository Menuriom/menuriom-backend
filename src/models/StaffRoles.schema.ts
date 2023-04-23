import { Document, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { StaffPermission } from "./StaffPermissions.schema";
export type StaffRoleDocument = StaffRole & Document;

export const StaffRoleSchema = new Schema({
    name: { type: String, required: true },
    permissions: [{ type: String }],
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface StaffRole {
    _id: Types.ObjectId;
    name: string;
    permissions: Array<StaffPermission | String>;
    createdAt: Date;
    translation: Translation;
}
