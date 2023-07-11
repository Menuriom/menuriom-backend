import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Brand } from "./Brands.schema";
import { Branch } from "./Branches.schema";
export type QrCodeDocument = QrCode & Document;

export const QrCodeSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    image: { type: String, required: true },
    link: { type: String, required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface QrCode {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;
    branch: PopulatedDoc<Branch>;
    image: string;
    link: string;
    createdAt: Date;
}
