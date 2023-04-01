import { Document, Schema } from "mongoose";
import { Menu } from "./Menus.schema";
export type QrCodeDocument = QrCode & Document;

export const QrCodeSchema = new Schema({
    image: { type: String, required: true },
    link: { type: String, required: true },
    menu: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface QrCode {
    _id: Schema.Types.ObjectId;
    image: string;
    link: string;
    menu: Menu | Schema.Types.ObjectId;
    createdAt: Date;
}
