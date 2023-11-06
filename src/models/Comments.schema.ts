import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Brand } from "./Brands.schema";
import { MenuItem } from "./MenuItems.schema";
import { Utkn } from "./Utkns.schema";
export type CommentDocument = Comment & Document;

export const CommentSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    utkn: { type: Schema.Types.ObjectId, ref: "Utkn", required: true },

    name: { type: String, required: true },
    family: { type: String, required: true },
    mobile: { type: String, required: true },
    comment: { type: String, required: true },

    status: { type: String, enum: ["pending", "accepted", "rejected"] },
    createdAt: { type: Date, default: new Date(Date.now()) },
});

export interface Comment {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;
    menuItem: PopulatedDoc<MenuItem>;
    utkn: PopulatedDoc<Utkn>;

    name: string;
    family: string;
    mobile: string;
    comment: string;

    status: "pending" | "accepted" | "rejected";
    createdAt: Date;
}
