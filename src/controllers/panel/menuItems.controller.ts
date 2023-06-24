import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
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
import { unlink } from "fs/promises";
import { Branch } from "src/models/Branches.schema";
import { MenuService } from "src/services/menu.service";
import { CreateNewItemDto } from "src/dto/panel/menuItems.dto";
import { MenuItemDocument } from "src/models/MenuItems.schema";

@Controller("panel/menu-items")
export class MenuItemsController {
    constructor(
        // ...
        readonly PlanService: PlanService,
        readonly FileService: FileService,
        readonly MenuService: MenuService,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("MenuCategory") private readonly MenuCategoryModel: Model<MenuCategoryDocument>,
        @InjectModel("MenuItem") private readonly MenuItemModel: Model<MenuItemDocument>,
    ) {}

    @Get("/")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];
        const categories = await this.MenuCategoryModel.find({ brand: brandID })
            .select("_id icon name description order branches hidden showAsNew translation")
            .sort({ order: "ascending" })
            .exec();
        const categoryCount = await this.MenuCategoryModel.countDocuments({ brand: brandID }).exec();

        return res.json({ records: categories, canCreateNewCategory: categoryCount < 500 });
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
    @UseInterceptors(FilesInterceptor("gallery"))
    async addRecord(
        @UploadedFiles() gallery: Express.Multer.File[],
        @Body() body: CreateNewItemDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        const brandID = req.headers["brand"];

        // TODO
        // add check for every side item group id and only add existing ones

        // check if selected category exists
        const doesCategoryExists = await this.MenuCategoryModel.exists({ _id: new Types.ObjectId(body.selectedCategory), brand: brandID }).exec();
        if (!doesCategoryExists) {
            throw new UnprocessableEntityException([
                { property: "selectedCategory", errors: [I18nContext.current().t("panel.menu.Selected category does not exist")] },
            ]);
        }

        const menuItemCount = await this.MenuItemModel.countDocuments({ brand: brandID }).exec();
        if (menuItemCount >= 500) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.menu.noMoreMenuItemsAllowed")] }]);
        }

        let Has_itemHighlighting = false;
        let Has_menuTagOption = false;
        const brandsPlan = await this.BrandsPlanModel.findOne({ brand: brandID }).populate<{ currentPlan: Plan }>("currentPlan", "_id limitations").exec();
        if (this.PlanService.checkLimitations([["item-highlighting", true]], brandsPlan.currentPlan.limitations)) Has_itemHighlighting = true;
        if (this.PlanService.checkLimitations([["menu-tag-option", true]], brandsPlan.currentPlan.limitations)) Has_menuTagOption = true;

        const images = await this.FileService.saveUploadedImages(gallery, "", 2 * 1_048_576, ["png", "jpeg", "jpg", "webp"], 320, "public", "/menuItemsImages");

        const variants = [];
        for (const variant of body.variants) {
            const variantObj = JSON.parse(variant);
            const { default: name, ...nameTranslations } = variantObj.name.values;

            const translation = {};
            for (const [lang, value] of Object.entries(nameTranslations)) {
                if (!translation[lang]) translation[lang] = {};
                if (value) translation[lang]["name"] = value;
            }
            variants.push({ name: variantObj.name.values.default, price: variantObj.price || 0, translation: translation });
        }

        const translation = {};
        for (const lang in languages) {
            translation[lang] = {
                name: body[`name.${lang}`] || "",
            };
        }

        await this.MenuItemModel.create({
            brand: brandID,
            branches: body.branches || [],
            category: body.selectedCategory,

            order: 0,
            images: images,
            name: body["name.default"],
            description: body["description.default"],
            price: body.price,
            variants: variants,

            discountActive: body.discountActive === "true" && Has_itemHighlighting ? true : false,
            discountPercentage: body.discountPercentage,

            hidden: body.hidden === "true" ? true : false,
            pinned: body.pinned === "true" && Has_itemHighlighting ? true : false,
            soldOut: body.soldOut === "true" ? true : false,
            showAsNew: body.showAsNew === "true" && Has_menuTagOption ? true : false,

            specialDaysActive: body.specialDaysActive === "true" && Has_itemHighlighting ? true : false,
            specialDaysList: body.specialDaysList || [],

            // TODO : check and add side items
            // sideItems
            tags: [],
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
        @UploadedFiles() uploadedIcon: Express.Multer.File,
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
