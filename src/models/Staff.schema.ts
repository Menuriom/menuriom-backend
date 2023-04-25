import { Document, Schema, Types } from "mongoose";
import { Branch } from "./Branches.schema";
import { StaffRole } from "./StaffRoles.schema";
import { User } from "./Users.schema";
import { Brand } from "./Brands.schema";
export type StaffDocument = Staff & Document;

export const StaffSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
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
    _id: Types.ObjectId;
    user: User | Types.ObjectId;
    brand: Brand & Types.ObjectId;
    brandPermissions: string[];
    branches: Array<{
        branch: Branch | Types.ObjectId;
        role: StaffRole & Types.ObjectId;
    }>;
    createdAt: Date;
}
