import { Document, Schema } from "mongoose";
import { Branch } from "./Branches.schema";
import { Brand } from "./Brands.schema";
import { StaffRole } from "./StaffRoles.schema";
export type InviteDocument = Invite & Document;

export const InviteSchema = new Schema({
    email: { type: String, lowercase: true },
    mobile: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    brandPermissions: [{ type: String }],
    branches: new Schema({
        branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
        role: { type: Schema.Types.ObjectId, ref: "UserRole", required: true },
    }),
    status: {
        type: String,
        enum: ["sent", "rejected"],
        default: "sent",
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface Invite {
    _id: Schema.Types.ObjectId;
    email?: string;
    mobile?: string;
    brand: Brand | Schema.Types.ObjectId;
    brandPermissions: string[];
    branches: {
        branch: Branch | Schema.Types.ObjectId;
        role: StaffRole | Schema.Types.ObjectId;
    };
    status: "sent" | "rejected";
    createdAt: Date;
}
