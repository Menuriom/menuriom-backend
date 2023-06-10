import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Branch } from "./Branches.schema";
import { Brand } from "./Brands.schema";
import { StaffRole } from "./StaffRoles.schema";
export type InviteDocument = Invite & Document;

export const InviteSchema = new Schema({
    email: { type: String, lowercase: true },
    mobile: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    role: { type: Schema.Types.ObjectId, ref: "StaffRole", required: true },
    branches: [{ type: Schema.Types.ObjectId, ref: "Branch", required: true }],
    status: {
        type: String,
        enum: ["sent", "accepted", "rejected"],
        default: "sent",
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface Invite {
    _id: Types.ObjectId;
    email?: string;
    mobile?: string;
    brand: Brand & Types.ObjectId;
    role: StaffRole & Types.ObjectId;
    branches: PopulatedDoc<Branch>[];
    status?: "sent" | "accepted" | "rejected";
    createdAt: Date;
}
