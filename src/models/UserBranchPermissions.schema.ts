import { Document, Schema } from "mongoose";
import { Translation } from "src/interfaces/Translation.interface";
import { Branch } from "./Branches.schema";
import { UserPermissionGroup } from "./UserPermissionGroups.schema";
import { User } from "./users.schema";
export type UserBranchPermissionDocument = UserBranchPermission & Document;

export const UserBranchPermissionsSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    permissionGroup: { type: Schema.Types.ObjectId, ref: "UserPermissionGroup", required: true },
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
    user: User | Schema.Types.ObjectId;
    branch: Branch | Schema.Types.ObjectId;
    permissionGroup: UserPermissionGroup | Schema.Types.ObjectId;
    createdAt: Date;
    translation: Translation;
}
