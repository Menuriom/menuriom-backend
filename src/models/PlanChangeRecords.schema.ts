import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Plan } from "./Plans.schema";
import { User } from "./Users.schema";
import { Brand } from "./Brands.schema";
export type PlanChangeRecordDocument = PlanChangeRecord & Document;

export const PlanChangeRecordSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    previusPlan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    newPlan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    previusPeriod: { type: String, enum: ["monthly", "yearly"], default: "monthly", required: true },
    newPeriod: { type: String, enum: ["monthly", "yearly"], default: "monthly", required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface PlanChangeRecord {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;
    user: PopulatedDoc<User>;
    previusPlan: PopulatedDoc<Plan>;
    newPlan: PopulatedDoc<Plan>;
    previusPeriod: "monthly" | "yearly";
    newPeriod: "monthly" | "yearly";
    createdAt: Date;
}
