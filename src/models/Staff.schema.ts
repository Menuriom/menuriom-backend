import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Branch } from "./Branches.schema";
import { StaffRole } from "./StaffRoles.schema";
import { User } from "./Users.schema";
import { Brand } from "./Brands.schema";
export type StaffDocument = Staff & Document;

export const StaffSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    role: { type: Schema.Types.ObjectId, ref: "StaffRole", required: true },
    branches: [{ type: Schema.Types.ObjectId, ref: "Branch", required: true }],
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface Staff {
    _id: Types.ObjectId;
    user: PopulatedDoc<User>;
    brand: Brand & Types.ObjectId;
    role: StaffRole & Types.ObjectId;
    branches:  PopulatedDoc<Branch>[];
    createdAt: Date;
}
