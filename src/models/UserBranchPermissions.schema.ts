import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
export type UserBranchPermissionDocument = UserBranchPermission & Document;

export const UserBranchPermissionsSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branches", required: true },
    permissionGroup: { type: Schema.Types.ObjectId, ref: "UserPermissionGroups", required: true },
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

export interface UserBranchPermission {
    _id: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId;
    brand: Schema.Types.ObjectId;
    permissionGroup: Schema.Types.ObjectId;
    createdAt: Date;
    translation: Translation;
}
