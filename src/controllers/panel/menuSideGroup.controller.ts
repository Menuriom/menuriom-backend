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
import { CreateNewCategoryDto, EditCategoryDto, updateOrderDto } from "src/dto/panel/menuCategory.dto";
import { BrandDocument } from "src/models/Brands.schema";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { Plan } from "src/models/Plans.schema";
import { PlanService } from "src/services/plan.service";
import { FileService } from "src/services/file.service";
import { Branch } from "src/models/Branches.schema";
import { MenuService } from "src/services/menu.service";
import { MenuSideGroupDocument } from "src/models/MenuSideGroups.schema";
import { CreateNewSideGroupDto } from "src/dto/panel/sideGroup.dto";

@Controller("panel/menu-sides")
export class MenuSideGroupController {
    constructor(
        // ...
        readonly PlanService: PlanService,
        readonly FileService: FileService,
        readonly MenuService: MenuService,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("MenuCategory") private readonly MenuCategoryModel: Model<MenuCategoryDocument>,
        @InjectModel("MenuSideGroup") private readonly MenuSideGroupModel: Model<MenuSideGroupDocument>,
    ) {}

    @Get("/")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];
        const groups = await this.MenuSideGroupModel.find({ brand: brandID }).select("_id name description items maxNumberUserCanChoose translation").exec();
        const groupCount = await this.MenuSideGroupModel.countDocuments({ brand: brandID }).exec();

        return res.json({ records: groups, canCreateNewGroup: groupCount < 100 });
    }

    @Get("/:id")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const group = await this.MenuSideGroupModel.findOne({ _id: params.id }).select("_id name description items maxNumberUserCanChoose translation").exec();
        if (!group) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        const name = { default: group.name };
        const description = { default: group.description };
        for (const lang in languages) {
            if (group.translation && group.translation[lang]) {
                name[lang] = group.translation[lang].name;
                description[lang] = group.translation[lang].description;
            }
        }

        return res.json({ name, description, items: group.items, maximum: group.maxNumberUserCanChoose });
    }

    @Post("/")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    @UseInterceptors(FileInterceptor("uploadedFile"))
    async addRecord(@Body() body: CreateNewSideGroupDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const groupCount = await this.MenuSideGroupModel.countDocuments({ brand: brandID }).exec();
        if (groupCount >= 100) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.menu.noMoreSideGroupAllowed")] }]);
        }

        const items = [];
        for (const item of body.items) {
            const itemObj = JSON.parse(item);
            const { default: name, ...nameTranslations } = itemObj.name.values;

            const translation = {};
            for (const [lang, value] of Object.entries(nameTranslations)) {
                if (!translation[lang]) translation[lang] = {};
                if (value) translation[lang]["name"] = value;
            }
            items.push({ name: itemObj.name.values.default, price: itemObj.price || 0, translation: translation });
        }

        const translation = {};
        for (const lang in languages) {
            translation[lang] = {
                name: body[`name.${lang}`] || "",
                description: body[`description.${lang}`] || "",
            };
        }

        await this.MenuSideGroupModel.create({
            brand: brandID,
            name: body["name.default"] || "",
            description: body["description.default"] || "",
            maxNumberUserCanChoose: body.maximum || Infinity,
            items: items,
            createdAt: new Date(Date.now()),
            translation: translation,
        }).catch((e) => {
            console.log({ e });
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

    @Post("/hide/:id")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async toggleCategoryVisibility(@Param() param: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const category = await this.MenuCategoryModel.findOne({ _id: param.id }).select("_id hidden").exec();
        if (!category) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        await this.MenuCategoryModel.updateOne({ _id: param.id }, { hidden: !category.hidden }).exec();

        return res.end();
    }

    @Post("/update-order")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async updateCategoryOrders(@Body() body: updateOrderDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const writes = [];
        body.orderedCategories.forEach((item) => {
            writes.push({ updateOne: { filter: { _id: item._id }, update: { order: item.order } } });
        });
        await this.MenuCategoryModel.bulkWrite(writes);

        return res.end();
    }
}
