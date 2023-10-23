import { Body, Param, Query, Controller, UseGuards, Get, Post, Req, Res, UseInterceptors, UploadedFile, UploadedFiles } from "@nestjs/common";
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
import { FileService } from "src/services/file.service";
import { MenuSytleDocument } from "src/models/MenuStyles.schema";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Plan } from "src/models/Plans.schema";

@Controller("panel/menu-styles")
export class MenuStylesController {
    constructor(
        // ...
        readonly PlanService: PlanService,
        readonly FileService: FileService,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("MenuStyle") private readonly MenuStyleModel: Model<MenuSytleDocument>,
    ) {}

    // TODO : we could have a secret menu section in menus that users can access somehow

    @Get("/")
    @SetPermissions("main-panel.menu.style")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async loadMenuStyles(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const menuStyles = await this.MenuStyleModel.findOne({ brand: brandID }).lean();

        return res.json({ menuStyles });
    }

    @Post("/")
    @SetPermissions("main-panel.menu.style")
    @UseGuards(AuthorizeUserInSelectedBrand)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: "headerBgImageFile" },
            { name: "itemListBgImageFile" },
            { name: "restaurantDetailsBgImageFile" },
            { name: "splashScreenBgImageFile" },
        ]),
    )
    async saveMenuStyles(
        @UploadedFiles()
        files: {
            headerBgImageFile: Express.Multer.File;
            itemListBgImageFile: Express.Multer.File;
            restaurantDetailsBgImageFile: Express.Multer.File;
            splashScreenBgImageFile: Express.Multer.File;
        },
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        const brandID = req.headers["brand"];

        let headerBgImageUrl = "";
        let itemListBgImageUrl = "";
        let restaurantDetailsBgImageUrl = "";
        let splashScreenBgImageUrl = "";

        const brandsPlan = await this.BrandsPlanModel.findOne({ brand: brandID }).populate<{ currentPlan: Plan }>("currentPlan", "_id limitations").exec();
        if (brandsPlan.currentPlan.name == "پلن حرفه ای") {
            if (files.headerBgImageFile) {
                const uploadedHeaderBgImage = await this.FileService.saveUploadedImages(
                    [files.headerBgImageFile[0]],
                    "",
                    1 * 1_048_576,
                    ["png", "jpeg", "jpg", "webp"],
                    480,
                    "public",
                    "/customPatterns",
                );
                headerBgImageUrl = uploadedHeaderBgImage[0];
            }
            if (files.itemListBgImageFile) {
                const uploadedItemListBgImage = await this.FileService.saveUploadedImages(
                    [files.itemListBgImageFile[0]],
                    "",
                    1 * 1_048_576,
                    ["png", "jpeg", "jpg", "webp"],
                    480,
                    "public",
                    "/customPatterns",
                );
                itemListBgImageUrl = uploadedItemListBgImage[0];
            }

            if (files.restaurantDetailsBgImageFile) {
                const uploadedRestaurantDetailsBgImage = await this.FileService.saveUploadedImages(
                    [files.restaurantDetailsBgImageFile[0]],
                    "",
                    1 * 1_048_576,
                    ["png", "jpeg", "jpg", "webp"],
                    480,
                    "public",
                    "/customPatterns",
                );
                restaurantDetailsBgImageUrl = uploadedRestaurantDetailsBgImage[0];
            }

            if (files.splashScreenBgImageFile) {
                const uploadedSplashScreenBgImage = await this.FileService.saveUploadedImages(
                    [files.splashScreenBgImageFile[0]],
                    "",
                    1 * 1_048_576,
                    ["png", "jpeg", "jpg", "webp"],
                    480,
                    "public",
                    "/customPatterns",
                );
                splashScreenBgImageUrl = uploadedSplashScreenBgImage[0];
            }
        }

        const baseColors = JSON.parse(req.body.baseColors);
        const mainMenuStyleOptions = JSON.parse(req.body.mainMenuStyleOptions);
        const itemsDialogStyleOptions = JSON.parse(req.body.itemsDialogStyleOptions);
        const restaurantDetailsPageOptions = JSON.parse(req.body.restaurantDetailsPageOptions);
        const splashScreenOptions = JSON.parse(req.body.splashScreenOptions);

        delete mainMenuStyleOptions.headerOptions.bgImageFile;
        delete mainMenuStyleOptions.itemListOptions.bgImageFile;
        delete restaurantDetailsPageOptions.bgImageFile;
        delete splashScreenOptions.bgImageFile;

        if (mainMenuStyleOptions.headerOptions.bgImageMode === "upload") mainMenuStyleOptions.headerOptions.bgImage = headerBgImageUrl;
        if (mainMenuStyleOptions.itemListOptions.bgImageMode === "upload") mainMenuStyleOptions.itemListOptions.bgImage = itemListBgImageUrl;
        if (restaurantDetailsPageOptions.bgImageMode === "upload") restaurantDetailsPageOptions.bgImage = restaurantDetailsBgImageUrl;
        if (splashScreenOptions.bgImageMode === "upload") splashScreenOptions.bgImage = splashScreenBgImageUrl;

        await this.MenuStyleModel.updateOne(
            { brand: brandID },
            {
                $set: {
                    baseColors: baseColors,
                    mainMenuStyleOptions: mainMenuStyleOptions,
                    itemsDialogStyleOptions: itemsDialogStyleOptions,
                    restaurantDetailsPageOptions: restaurantDetailsPageOptions,
                    splashScreenOptions: splashScreenOptions,
                    updatedAt: new Date(Date.now()),
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
