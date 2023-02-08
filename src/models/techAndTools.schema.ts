import { Document, Schema } from "mongoose";

export type TechAndToolDocument = TechAndTool & Document;

export const TechAndToolSchema = new Schema({
    image: { type: String },
    name: { type: String, required: true },
    mostUsed: { type: String, required: true, default: "off", enum: ["off", "design", "develop", "deploy"] },
    showInList: { type: Boolean, required: true, default: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface TechAndTool {
    _id: Schema.Types.ObjectId;
    image: String;
    name: String;
    mostUsed: String;
    showInList: Boolean;
    createdAt: Date;
}
