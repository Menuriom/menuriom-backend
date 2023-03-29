import { Document, Schema } from "mongoose";
import { Brand } from "./Brands.schema";
import { UserPermissionGroup } from "./UserPermissionGroups.schema";
import { User } from "./Users.schema";
export type UserBranchPermissionDocument = UserBranchPermission & Document;

export const UserBranchPermissionsSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    permissionGroup: { type: Schema.Types.ObjectId, ref: "UserPermissionGroup", required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface UserBranchPermission {
    _id: Schema.Types.ObjectId;
    user: User | Schema.Types.ObjectId;
    brand: Brand | Schema.Types.ObjectId;
    permissionGroup: UserPermissionGroup | Schema.Types.ObjectId;
    createdAt: Date;
}
