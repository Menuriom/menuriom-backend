import { Document, Schema } from "mongoose";

export type TagDocument = Tag & Document;

export const TagSchema = new Schema({
    name: { type: String, required: true },
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface Tag {
    _id: Schema.Types.ObjectId;
    name: String;
    createdAt: Date;
}
