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
    data: any;
    lang?: string;

    createdAt: Date;
    translation: Translation;
}

export interface BillReminderData {
    type: "bill-reminder";
    data: { billID: string; billNumber: string; type: "planChange" | "renewal" };
}
export interface NewBillData {
    type: "new-bill";
    data: { billID: string; billNumber: string; type: "planChange" | "renewal" };
}
export interface NewTransactionData {
    type: "new-transaction";
    data: { billID: string; transactionID: string; billNumber: string };
}
export interface NewInviteData {
    type: "new-invite";
    data: { brandName: string; roleName: string };
}
export interface InviteUpdateData {
    type: "invite-update";
    data: { userEmail: string; status: "accepted" | "rejected" };
}
export interface WelcomeNewUserData {
    type: "welcome-new-user";
    data: Object;
}
export interface BrandUsernameChangeData {
    type: "brand-username-change";
    data: { oldUsername: string; newUsername: string };
}
