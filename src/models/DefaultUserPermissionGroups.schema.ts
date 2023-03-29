import { Document, Schema } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { UserPermission } from "./UserPermissions.schema";
export type DefaultUserPermissionGroupDocument = DefaultUserPermissionGroup & Document;

export const DefaultUserPermissionGroupsSchema = new Schema({
    name: { type: String, required: true },
    permissions: [{ type: String }],
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface DefaultUserPermissionGroup {
    _id: Schema.Types.ObjectId;
    name: string;
    permissions?: UserPermission[] | string[];
    createdAt: Date;
    translation: Translation;
}
