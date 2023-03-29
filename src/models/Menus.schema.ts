import { Document, Schema } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { Branch } from "./Branches.schema";
export type MenuDocument = Menu & Document;

export const MenusSchema = new Schema({
    name: { type: String, required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    type: { type: String, required: true },
    categories: new Schema({
        icon: { type: String, required: true },
        name: { type: String, required: true },
    }),
    colors: new Schema({
        header: { type: String, required: true },
        HeaderText: { type: String, required: true },
    }),
    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
    translation: TranslationSchema,
});

export interface Menu {
    _id: Schema.Types.ObjectId;
    name: string;
    branch: Branch | Schema.Types.ObjectId;
    type: string;
    categories: Category;
    colors: Color;
    createdAt: Date;
    translation: Translation;
}

export interface Category {
    icon: string;
    name: string;
}

export interface Color {
    header: string;
    HeaderText: string;
}
