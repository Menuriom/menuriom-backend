import { Body, Controller, Get, UseGuards, Post, Put, Req, Res } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { NotificationDocument } from "src/models/Notifications.schema";
import { NotifsService } from "src/services/notifs.service";
import { BrandDocument } from "src/models/Brands.schema";
import { StaffDocument } from "src/models/Staff.schema";
import { StaffRole } from "src/models/StaffRoles.schema";

@Controller("panel/notifications")
export class NotificationsController {
    constructor(
        // ...
        private readonly notifsService: NotifsService,
        @InjectModel("Notification") private readonly NotificationModel: Model<NotificationDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
    ) {}

    @Get("/")
    @SetPermissions("main-panel")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getNotifs(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        const isUserOwner = await this.BrandModel.exists({ _id: brandID, creator: req.session.userID }).exec();

        const query: any = {};
        const type = ["new-invite", "welcome-new-user"];
        if (!isUserOwner) {
            const staff = await this.StaffModel.findOne({ brand: brandID, user: req.session.userID })
                .populate<{ role: StaffRole }>("role", "name permissions")
                .exec();
            if (staff && staff.role.permissions.includes("main-panel.billing.access")) {
                type.push("bill-reminder");
                type.push("new-bill");
                type.push("new-transaction");
            }
            if (staff && staff.role.permissions.includes("main-panel.staff.invite")) {
                type.push("invite-update");
            }
            if (staff && staff.role.permissions.includes("main-panel.settings")) {
                type.push("brand-username-change");
            }
            query.type = { $in: type };
        }

        const notifs = await this.NotificationModel.find({ $or: [{ user: req.session.userID }, { brand: brandID }], showInSys: true, ...query })
            .select("viewedInSysAt type title text createdAt translation")
            .limit(25)
            .exec();

        return res.json({ notifs });
    }

    @Get("/new")
    @SetPermissions("main-panel")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async checkNewNotif(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        const newNotifs = await this.NotificationModel.exists({
            $and: [
                {
                    $or: [{ user: req.session.userID }, { brand: brandID }],
                },
                {
                    $or: [{ viewedInSysAt: null }, { viewedInSysAt: { $exists: false } }],
                },
            ],
            showInSys: true,
        }).exec();

        return res.json({ newNotifs });
    }

    @Post("/mark-as-read")
    @SetPermissions("main-panel")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getMarkAsRead(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        await this.NotificationModel.updateMany(
            {
                $and: [
                    {
                        $or: [{ user: req.session.userID }, { brand: brandID }],
                    },
                    {
                        $or: [{ viewedInSysAt: null }, { viewedInSysAt: { $exists: false } }],
                    },
                ],
                showInSys: true,
            },
            { viewedInSysAt: new Date(Date.now()) },
        ).exec();

        return res.end();
    }
}
