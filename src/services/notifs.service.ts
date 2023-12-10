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
};

@Injectable()
export class NotifsService {
    constructor(
        // ...
        @InjectModel("Notification") private readonly NotificationModel: Model<NotificationDocument>,
    ) {}

    async notif({ user, brand, showInSys, sendAsEmail, type, data }: BaseInput) {
        const { title, text, transaction } = this.getTitleAndText(type);

        await this.NotificationModel.create({ user, brand, showInSys, sendAsEmail, type, title, text, data, transaction, createdAt: new Date(Date.now()) });
    }

    // ========================================

    private getTitleAndText(type: Notification["type"]): { title: string; text: string; transaction: any } {
        let title: string;
        let text: string;
        let transaction: string;

        // TODO
        // fill the title and text
        // also fill translations for them

        switch (type) {
            case "welcome-new-user":
                break;
            case "new-transaction":
                break;
            case "new-bill":
                break;
            case "bill-reminder":
                break;
            case "new-invite":
                break;
            case "invite-update":
                break;
            case "brand-username-change":
                break;
        }

        return { title, text, transaction };
    }
}
