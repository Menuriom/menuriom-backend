import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notification, NotificationDocument } from "src/models/Notifications.schema";

type BaseInput = {
    user?: string;
    brand?: string;
    showInSys?: boolean;
    sendAsEmail?: boolean;
    type: Notification["type"];
    data?: any;
    lang?: string;
};

@Injectable()
export class NotifsService {
    constructor(
        // ...
        @InjectModel("Notification") private readonly NotificationModel: Model<NotificationDocument>,
    ) {}

    async notif({ user, brand, showInSys, sendAsEmail, type, data, lang }: BaseInput) {
        const { title, text, translation } = this.getTitleAndText(type, data);

        await this.NotificationModel.create({ user, brand, showInSys, sendAsEmail, type, title, text, data, lang, translation, createdAt: new Date(Date.now()) });
    }

    // ========================================

    private getTitleAndText(type: Notification["type"], data: any): { title: string; text: string; translation: any } {
        let title: string;
        let text: string;
        let translation: {};

        switch (type) {
            case "welcome-new-user":
                title = "به منوریوم خوش اومدی";
                text = "برای شروع برند جدیدی بسازید یا عضو یک رستوران شوید";
                translation = {
                    en: {
                        title: "Welcome To Menuriom",
                        text: "Start by creating a new brand or joining a restaurant",
                    },
                };
                break;
            case "new-transaction":
                title = "تراکنش بانکی جدید";
                text = `تراکنش بانکی برای قبض به شماره ${data.billNumber}`;
                translation = {
                    en: {
                        title: "New Payment Transaction",
                        text: `Payment transaction for bill number ${data.billNumber}`,
                    },
                };
                break;
            case "new-bill":
                title = `قبض جدید با شماره ${data.billNumber}`;
                text = `صدور قبض ${data.type == "planChange" ? "تغییر" : "تمدید"} اشتراک با شماره ${data.billNumber}`;
                translation = {
                    en: {
                        title: `New Bill With Code ${data.billNumber}`,
                        text: `Newly issued bill for plan ${data.type == "planChange" ? "change" : "renewal"} with code number ${data.billNumber}`,
                    },
                };
                break;
            case "bill-reminder":
                title = "یادآوری پرداخت قبض";
                text = "قبض تمدید اشتراک شما صادر شده. لطفا برای پرداخت آن اقدام کنید";
                translation = {
                    en: {
                        title: "Bill Payment Reminder",
                        text: "Your subscription renewal bill has been issued. Please pay it before due",
                    },
                };
                break;
            case "new-invite":
                title = "دعوت نامه جدید";
                text = `دعوت نامه جدیدی از سمت برند ${data.brandName} برای شما ارسال شده`;
                translation = {
                    en: {
                        title: "New Invite",
                        text: `You have a new invite from brand ${data.brandName}`,
                    },
                };
                break;
            case "invite-update":
                title = "پاسخ دعوت نامه ارسالی";
                text = `دعوت نامه ارسالی شما به کاربر ${data.userEmail}، ${data.status == "accepted" ? "تایید" : "رد"} شد`;
                translation = {
                    en: {
                        title: "Sent Invite Update",
                        text: `Invite you sent to user ${data.userEmail}, has been ${data.status}`,
                    },
                };
                break;
            case "brand-username-change":
                title = "تغییر نام کاربری برند";
                text = "نام کاربری برند شما تغییر کرد. لینک منو و کد کیو ار شما نیز اپدیت شدند";
                translation = {
                    en: {
                        title: "Brand Username Has Been Changed",
                        text: "Your brand username is updated. Your menu and QR code also updated",
                    },
                };
                break;
        }

        return { title, text, translation };
    }
}
