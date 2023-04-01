import { Document, Schema } from "mongoose";
import { Branch } from "./Branches.schema";
import { Brand } from "./Brands.schema";
import { QrCode } from "./QrCodes.schema";
import { User } from "./Users.schema";
export type TableDocument = Table & Document;

export const TableSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    qrCode: { type: Schema.Types.ObjectId, ref: "QrCode", required: true },
    server: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tableNumber: { type: Number, required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface Table {
    _id: Schema.Types.ObjectId;
    brand: Brand | Schema.Types.ObjectId;
    branch: Branch | Schema.Types.ObjectId;
    qrCode: QrCode | Schema.Types.ObjectId;
    server: User | Schema.Types.ObjectId;
    tableNumber: number;
    createdAt: Date;
}
