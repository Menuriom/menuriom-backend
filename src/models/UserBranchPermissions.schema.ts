import { Document, Schema } from "mongoose";
import { Branch } from "./Branches.schema";
import { UserRole } from "./UserRoles.schema";
import { User } from "./Users.schema";
export type UserBranchPermissionDocument = UserBranchPermission & Document;

export const UserBranchPermissionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    Role: { type: Schema.Types.ObjectId, ref: "UserRole", required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface UserBranchPermission {
    _id: Schema.Types.ObjectId;
    user: User | Schema.Types.ObjectId;
    branch: Branch | Schema.Types.ObjectId;
    Role: UserRole | Schema.Types.ObjectId;
    createdAt: Date;
}
