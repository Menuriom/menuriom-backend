import { Document, Schema } from "mongoose";
import { Branch } from "./Branches.schema";
import { StaffRole } from "./StaffRoles.schema";
import { User } from "./Users.schema";
export type StaffDocument = Staff & Document;

export const StaffSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    brandPermissions: [{ type: String }],
    branches: new Schema({
        branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
        role: { type: Schema.Types.ObjectId, ref: "UserRole", required: true },
    }),
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface Staff {
    _id: Schema.Types.ObjectId;
    user: User | Schema.Types.ObjectId;
    branch: Branch | Schema.Types.ObjectId;
    Role: StaffRole | Schema.Types.ObjectId;
    createdAt: Date;
}
