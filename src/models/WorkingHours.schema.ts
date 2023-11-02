import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Brand } from "./Brands.schema";
export type WorkingHourDocument = WorkingHour & Document;

export const WorkingHourSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    workingHours: { type: Object, required: true },
    createdAt: { type: Date, default: new Date(Date.now()) },
});

export interface WorkingHour {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;
    workingHours: Object;
    createdAt: Date;
}
