import { Document, Schema } from "mongoose";
import { Branch } from "./Branches.schema";
import { Brand } from "./Brands.schema";
export type InviteDocument = Invite & Document;

export const InviteSchema = new Schema({
    email: { type: String, lowercase: true },
    mobile: { type: String },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
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
    branch: Branch | Schema.Types.ObjectId;
    brand: Brand | Schema.Types.ObjectId;
    status: "sent" | "rejected";
    createdAt: Date;
}
