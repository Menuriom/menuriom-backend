import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Brand } from "./Brands.schema";
export type MenuSytleDocument = MenuSytle & Document;

export const MenuSytleSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },

    headerBgImage: { type: String },
    itemListBgImage: { type: String },
    restaurantDetailsBgImage: { type: String },
    splashScreenBgImage: { type: String },

    mainMenuStyleOptions: { type: Object, required: true },
    itemsDialogStyleOptions: { type: Object, required: true },
    restaurantDetailsPageOptions: { type: Object, required: true },
    splashScreenOptions: { type: Object, required: true },

    updatedAt: { type: Date, default: new Date(Date.now()) },
    createdAt: { type: Date, default: new Date(Date.now()) },
});

export interface MenuSytle {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;

    headerBgImage?: string;
    itemListBgImage?: string;
    restaurantDetailsBgImage?: string;
    splashScreenBgImage?: string;

    mainMenuStyleOptions: any;
    itemsDialogStyleOptions: any;
    restaurantDetailsPageOptions: any;
    splashScreenOptions: any;

    updatedAt: Date;
    createdAt: Date;
}
