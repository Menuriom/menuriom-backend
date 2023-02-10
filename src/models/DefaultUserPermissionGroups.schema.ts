import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
import { UserPermission } from "./UserPermissions.schema";
export type DefaultUserPermissionGroupDocument = DefaultUserPermissionGroup & Document;

export const DefaultUserPermissionGroupsSchema = new Schema({
    name: { type: String, required: true },
    permissions: [{ type: String }],
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

export interface DefaultUserPermissionGroup {
    _id: Schema.Types.ObjectId;
    name: string;
    permissions?: UserPermission[] | string[];
    createdAt: Date;
    translation: Translation;
}
