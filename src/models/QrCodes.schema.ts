import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Brand } from "./Brands.schema";
import { Branch } from "./Branches.schema";
export type QrCodeDocument = QrCode & Document;

export const QrCodeSchema = new Schema({
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },

    image: { type: String },

    link: { type: String, required: true },
    backgroundGradient: { type: Boolean },
    backgroundGradientType: { type: String },
    backgroundGradientAngle: { type: Number },
    backgroundColor1: { type: String },
    backgroundColor2: { type: String },
    foregroundGradient: { type: Boolean },
    foregroundGradientType: { type: String },
    foregroundGradientAngle: { type: Number },
    foregroundColor1: { type: String },
    foregroundColor2: { type: String },
    dotImage: { type: String },
    randomSize: { type: Boolean },
    customCorner: { type: Boolean },
    cornerRingColor: { type: String },
    cornerCenterColor: { type: String },
    cornerRingRadius: { type: Number },
    cornerCenterRadius: { type: Number },
    withLogo: { type: Boolean },
    logoPadding: { type: Number },
    logoBorderRadius: { type: Number },
    logoShadow: { type: Boolean },
    logoShadowIntensity: { type: Number },

    createdAt: {
        type: Date,
        default: new Date(Date.now()),
    },
});

export interface QrCode {
    _id: Types.ObjectId;
    brand: PopulatedDoc<Brand>;
    branch: PopulatedDoc<Branch>;

    image?: string;

    link: string;
    backgroundGradient?:boolean;
    backgroundGradientType?:string;
    backgroundGradientAngle?:number;
    backgroundColor1?:string;
    backgroundColor2?:string;
    foregroundGradient?:boolean;
    foregroundGradientType?:string;
    foregroundGradientAngle?:number;
    foregroundColor1?:string;
    foregroundColor2?:string;
    dotImage?:string;
    randomSize?:boolean;
    customCorner?:boolean;
    cornerRingColor?:string;
    cornerCenterColor?:string;
    cornerRingRadius?:number;
    cornerCenterRadius?:number;
    withLogo?:boolean;
    logoPadding?:number;
    logoBorderRadius?:number;
    logoShadow?:boolean;
    logoShadowIntensity?:number;

    createdAt: Date;
}
