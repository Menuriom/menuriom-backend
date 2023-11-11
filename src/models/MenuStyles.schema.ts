import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Brand } from "./Brands.schema";
export type MenuSytleDocument = MenuSytle & Document;

export const MenuSytleSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },

    baseColors: { type: Object, required: true },
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

    baseColors: any;
    mainMenuStyleOptions: any;
    itemsDialogStyleOptions: any;
    restaurantDetailsPageOptions: any;
    splashScreenOptions: any;

    updatedAt: Date;
    createdAt: Date;
}
