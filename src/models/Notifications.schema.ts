import { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Translation, TranslationSchema } from "src/interfaces/Translation.interface";
import { Brand } from "./Brands.schema";
import { User } from "./Users.schema";
export type NotificationDocument = Notification & Document;

export const NotificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },

    showInSys: { type: Boolean },
    viewedInSysAt: { type: Date },

    sendAsEmail: { type: Boolean },
    emailSentAt: { type: Date },

    type: {
        type: String,
        enum: ["bill-reminder", "new-bill", "new-transaction", "new-invite", "invite-update", "welcome-new-user", "brand-username-change"],
        required: true,
    },
    title: { type: String },
    text: { type: String },
    data: { type: Object },
    lang: { type: String },

    createdAt: { type: Date, default: new Date(Date.now()) },
    translation: TranslationSchema,
});

export interface Notification {
    _id: Types.ObjectId;
    user: PopulatedDoc<User>;
    brand: PopulatedDoc<Brand>;

    showInSys: boolean;
    viewedInSysAt: Date;

    sendAsEmail: boolean;
    emailSentAt: Date;

    type: "bill-reminder" | "new-bill" | "new-transaction" | "new-invite" | "invite-update" | "welcome-new-user" | "brand-username-change";
    title: string;
    text?: string;
    data: Object;
    lang?: string;

    createdAt: Date;
    translation: Translation;
}
