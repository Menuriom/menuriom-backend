import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UseInterceptors, UploadedFile } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserDocument } from "src/models/Users.schema";
import { I18nContext } from "nestjs-i18n";
import { languages } from "src/interfaces/Translation.interface";
import { IdDto } from "src/dto/general.dto";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { MenuCategoryDocument } from "src/models/MenuCategories.schema";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { CreateNewCategoryDto, EditCategoryDto } from "src/dto/panel/menuCategory.dto";
import { BrandDocument } from "src/models/Brands.schema";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { Plan } from "src/models/Plans.schema";
import { PlanService } from "src/services/plan.service";
import { FileService } from "src/services/file.service";
import { unlink } from "fs/promises";
import { Branch } from "src/models/Branches.schema";
import { MenuService } from "src/services/menu.service";

@Controller("panel/menu-categories")
export class MenuCategoriesController {
    constructor(
        // ...
        readonly PlanService: PlanService,
        readonly FileService: FileService,
        readonly MenuService: MenuService,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("MenuCategory") private readonly MenuCategoryModel: Model<MenuCategoryDocument>,
    ) {}

    @Get("/")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];
        const categories = await this.MenuCategoryModel.find({ brand: brandID }).select("icon name description hidden showAsNew translation").exec();
        const categoryCount = await this.MenuCategoryModel.countDocuments({ brand: brandID }).exec();

        return res.json({ records: categories, canCreateNewCategory: categoryCount < 100 });
    }

    @Get("/:id")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const category = await this.MenuCategoryModel.findOne({ _id: params.id })
            .select("_id icon name description hidden showAsNew translation")
            .populate<{ branches: Branch }>("branches", "_id name")
            .exec();

        if (!category) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        const name = { default: category.name };
        for (const lang in languages) {
            if (category.translation && category.translation[lang]) {
                name[lang] = category.translation[lang].name;
            }
        }

        return res.json({ icon: category.icon, name, branches: category.branches, showAsNew: category.showAsNew, hide: category.hidden });
    }

    @Post("/")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    @UseInterceptors(FileInterceptor("uploadedIcon"))
    async addRecord(
        @UploadedFile() uploadedIcon: Express.Multer.File,
        @Body() body: CreateNewCategoryDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const categoryCount = await this.MenuCategoryModel.countDocuments({ brand: brandID }).exec();
        if (categoryCount >= 100) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.menu.noMoreCategoryAllowed")] }]);
        }

        const brandsPlan = await this.BrandsPlanModel.findOne({ brand: brandID }).populate<{ currentPlan: Plan }>("currentPlan", "_id limitations").exec();

        let iconUrl: string = "";
        if (body.iconMode == "upload") {
            if (!this.PlanService.checkLimitations([["customizable-category-logo", true]], brandsPlan.currentPlan.limitations)) {
                throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.menu.noCategoryUploadAllowed")] }]);
            }
            if (!uploadedIcon) {
                throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.menu.noCategoryImage")] }]);
            }
            const uploadedFiles = await this.FileService.saveUploadedImages(
                [uploadedIcon],
                "",
                1 * 1_048_576,
                ["png", "jpeg", "jpg", "webp"],
                100,
                "public",
                "/customCategoryIcons",
            );
            iconUrl = uploadedFiles[0];
        } else {
            iconUrl = body.selectedIcon || "";
        }

        const translation = {};
        for (const lang in languages) {
            translation[lang] = {
                name: body[`name.${lang}`] || "",
            };
        }

        await this.MenuCategoryModel.create({
            brand: brandID,
            branches: body.branches || [],
            icon: iconUrl || "",
            hidden: body.hide === "true" ? true : false,
            showAsNew: body.showAsNew === "true" ? true : false,
            name: body["name.default"],
            createdAt: new Date(Date.now()),
            translation: translation,
        }).catch((e) => {
            throw new InternalServerErrorException();
        });

        return res.end();
    }

    @Put("/:id")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    @UseInterceptors(FileInterceptor("uploadedIcon"))
    async editRecord(
        @UploadedFile() uploadedIcon: Express.Multer.File,
        @Param() params: IdDto,
        @Body() body: EditCategoryDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const brandsPlan = await this.BrandsPlanModel.findOne({ brand: brandID }).populate<{ currentPlan: Plan }>("currentPlan", "_id limitations").exec();
        const menuCategory = await this.MenuCategoryModel.findOne({ _id: params.id }).select("_id icon").exec();

        let iconUrl: string = menuCategory.icon;
        if (body.iconMode == "upload" && uploadedIcon) {
            if (!this.PlanService.checkLimitations([["customizable-category-logo", true]], brandsPlan.currentPlan.limitations)) {
                throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.menu.noCategoryUploadAllowed")] }]);
            }
            const uploadedFiles = await this.FileService.saveUploadedImages(
                [uploadedIcon],
                "",
                1 * 1_048_576,
                ["png", "jpeg", "jpg", "webp"],
                100,
                "public",
                "/customCategoryIcons",
            );
            if (uploadedFiles[0]) {
                this.MenuService.removeCategoryCustomIcons(menuCategory.icon);
                iconUrl = uploadedFiles[0];
            }
        } else if (body.iconMode == "list" && body.selectedIcon) {
            this.MenuService.removeCategoryCustomIcons(menuCategory.icon);
            iconUrl = body.selectedIcon || menuCategory.icon || "";
        }

        const translation = {};
        for (const lang in languages) {
            translation[lang] = {
                name: body[`name.${lang}`] || "",
            };
        }

        await this.MenuCategoryModel.updateOne(
            { _id: params.id },
            {
                branches: body.branches || [],
                icon: iconUrl || "",
                hidden: body.hide === "true" ? true : false,
                showAsNew: body.showAsNew === "true" ? true : false,
                name: body["name.default"],
                translation: translation,
            },
        ).catch((e) => {
            throw new InternalServerErrorException();
        });

        return res.json({});
    }

    @Delete("/:id")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async deleteSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const category = await this.MenuCategoryModel.findOne({ _id: params.id }).select("_id icon").exec();
        if (!category) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        // TODO : delete all category items

        // delete category custom image
        await this.MenuService.removeCategoryCustomIcons(category.icon);

        // delete branch
        await this.MenuCategoryModel.deleteOne({ _id: params.id }).exec();

        return res.end();
    }
}
