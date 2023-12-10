import { Body, Controller, Get, UseGuards, Post, Put, Req, Res } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { NotificationDocument } from "src/models/Notifications.schema";

@Controller("panel/notifications")
export class NotificationsController {
    constructor(
        // ...
        @InjectModel("Notification") private readonly NotificationModel: Model<NotificationDocument>,
    ) {}

    // TODO
    // cronjob to cleanup notifs that createdAt of them passed 6 month

    @Get("/")
    @SetPermissions("main-panel")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getNotifs(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        // TODO
        // get current user
        // if owner of brand show all notifs
        // if staff memeber check permission and base on permission show list of notifs
        const notifs = await this.NotificationModel.find({ brand: brandID, showInSys: true }).select("viewedInSysAt type title text createdAt").limit(25).exec();

        return res.json({ notifs });
    }

    @Get("/new")
    @SetPermissions("main-panel")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async checkNewNotif(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        const newNotifs = await this.NotificationModel.exists({
            brand: brandID,
            showInSys: true,
            $or: [{ viewedInSysAt: null }, { viewedInSysAt: { $exists: false } }],
        }).exec();

        return res.json({ newNotifs });
    }

    @Post("/mark-as-read")
    @SetPermissions("main-panel")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getMarkAsRead(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        await this.NotificationModel.updateMany(
            { brand: brandID, showInSys: true, $or: [{ viewedInSysAt: null }, { viewedInSysAt: { $exists: false } }] },
            { viewedInSysAt: new Date(Date.now()) },
        ).exec();

        return res.end();
    }
}
