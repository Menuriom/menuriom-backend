import { Document, Schema } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { UserPermission } from "./UserPermissions.schema";
export type UserPermissionGroupDocument = UserPermissionGroup & Document;

export const UserPermissionGroupSchema = new Schema({
    name: { type: String, required: true },
    permissions: [{ type: String }],
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface UserPermissionGroup {
    _id: Schema.Types.ObjectId;
    name: string;
    permissions: Array<UserPermission | String>;
    createdAt: Date;
    translation: Translation;
}
