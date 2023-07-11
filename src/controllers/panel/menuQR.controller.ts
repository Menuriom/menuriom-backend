import { Body, Param, Query, Controller, UseGuards, Get, Post, Req, Res } from "@nestjs/common";
import { NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { I18nContext } from "nestjs-i18n";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { PlanService } from "src/services/plan.service";
import { QRSaveDto } from "src/dto/panel/QRCode.dto";
import { QrCodeDocument } from "src/models/QrCodes.schema";

@Controller("panel/menu-qrcode")
export class MenuQRController {
    constructor(
        // ...
        readonly PlanService: PlanService,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("QrCode") private readonly QrCodeModel: Model<QrCodeDocument>,
    ) {}

    @Get("/")
    @SetPermissions("main-panel.menu.qr-code")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async loadQRCode(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const qrSettings = await this.QrCodeModel.findOne({ brand: brandID }).lean();

        return res.json({qrSettings});
    }

    @Post("/")
    @SetPermissions("main-panel.menu.qr-code")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async saveQRCode(@Body() body: QRSaveDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        await this.QrCodeModel.updateOne(
            { brand: brandID },
            {
                $set: {
                    link: body.link,
                    backgroundGradient: body.backgroundGradient,
                    backgroundGradientType: body.backgroundGradientType,
                    backgroundGradientAngle: body.backgroundGradientAngle,
                    backgroundColor1: body.backgroundColor1,
                    backgroundColor2: body.backgroundColor2,
                    foregroundGradient: body.foregroundGradient,
                    foregroundGradientType: body.foregroundGradientType,
                    foregroundGradientAngle: body.foregroundGradientAngle,
                    foregroundColor1: body.foregroundColor1,
                    foregroundColor2: body.foregroundColor2,
                    dotImage: body.dotImage,
                    randomSize: body.randomSize,
                    customCorner: body.customCorner,
                    cornerRingColor: body.cornerRingColor,
                    cornerCenterColor: body.cornerCenterColor,
                    cornerRingRadius: Number(body.cornerRingRadius),
                    cornerCenterRadius: Number(body.cornerCenterRadius),
                    withLogo: body.withLogo,
                    logoPadding: Number(body.logoPadding),
                    logoBorderRadius: Number(body.logoBorderRadius),
                    logoShadow: body.logoShadow,
                    logoShadowIntensity: body.logoShadowIntensity,
                },
                $setOnInsert: { createdAt: new Date(Date.now()) },
            },
            { upsert: true },
        ).catch((e) => {
            console.log({ e });
            throw new InternalServerErrorException();
        });

        return res.end();
    }
}
