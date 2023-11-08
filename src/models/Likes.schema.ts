import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Brand } from "./Brands.schema";
import { MenuItem } from "./MenuItems.schema";
import { Utkn } from "./Utkns.schema";
export type LikeDocument = Like & Document;

export const LikeSchema = new Schema({
    menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    utkn: { type: Schema.Types.ObjectId, ref: "Utkn", required: true },
    createdAt: { type: Date, default: new Date(Date.now()) },
});

export interface Like {
    _id: Types.ObjectId;
    menuItem: PopulatedDoc<MenuItem>;
    utkn: PopulatedDoc<Utkn>;
    createdAt: Date;
}
