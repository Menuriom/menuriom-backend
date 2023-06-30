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
import { MenuCategory, MenuCategoryDocument } from "src/models/MenuCategories.schema";
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
import { MenuItemDto } from "src/dto/panel/menuItems.dto";
import { MenuItemDocument } from "src/models/MenuItems.schema";
import { MenuSideGroup, MenuSideGroupDocument } from "src/models/MenuSideGroups.schema";

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
        @InjectModel("MenuSideGroup") private readonly MenuSideGroupModel: Model<MenuSideGroupDocument>,
    ) {}

    @Get("/")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];
        const items = await this.MenuItemModel.find({ brand: brandID }).sort({ order: "ascending" }).populate("sideItems", "name").exec();
        const itemsCount = await this.MenuItemModel.countDocuments({ brand: brandID }).exec();

        return res.json({ records: items, canCreateNewItem: itemsCount < 500 });
    }

    @Get("/:id")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();
        const menuItem = await this.MenuItemModel.findOne({ _id: params.id, brand: brandID })
            .sort({ order: "ascending" })
            .populate<{ branches: Branch[] }>("branches", "_id name")
            .populate<{ category: MenuCategory }>("category", "_id name icon")
            .populate<{ sideItems: MenuSideGroup[] }>("sideItems", "_id name description")
            .exec();

        if (!menuItem) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        const name = { default: menuItem.name };
        const description = { default: menuItem.description };
        for (const lang in languages) {
            name[lang] = menuItem.translation[lang]?.name || "";
            description[lang] = menuItem.translation[lang]?.description || "";
        }

        const variants = [];
        for (const variant of menuItem.variants) {
            const modifyVariant = { name: { values: { default: variant.name } }, price: variant.price.toString() };
            for (const lang in languages) {
                modifyVariant.name.values[lang] = variant.translation[lang]?.name || "";
            }
            variants.push(modifyVariant);
        }

        return res.json({ ...menuItem.toJSON(), name, description, variants });
    }

    @Post("/")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    @UseInterceptors(FilesInterceptor("gallery"))
    async addRecord(
        @UploadedFiles() gallery: Express.Multer.File[],
        @Body() body: MenuItemDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        const brandID = req.headers["brand"];

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

        // add check for every side item group id and only add existing ones
        const sideItems = await this.MenuSideGroupModel.find({ _id: { $in: body.sideItemList }, brand: brandID })
            .select("_id")
            .exec();

        // limit user to upload at max 3 images
        if (gallery.length > 3) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("file.max file count is n", { args: { count: 3 } })] }]);
        }
        const images = await this.FileService.saveUploadedImages(gallery, "", 2 * 1_048_576, ["png", "jpeg", "jpg", "webp"], 320, "public", "/menuItemsImages");

        const variants = [];
        for (const variant of body.variants) {
            const variantObj = JSON.parse(variant);
            if (!variantObj.name.values.default) continue;

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

            sideItems: sideItems.map((group) => group._id),
            tags: [],
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
    @UseInterceptors(FilesInterceptor("gallery"))
    async editRecord(
        @UploadedFiles() gallery: Express.Multer.File[],
        @Param() params: IdDto,
        @Body() body: MenuItemDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const menuItem = await this.MenuItemModel.findOne({ _id: params.id }).exec();
        if (!menuItem) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        // check if selected category exists
        const doesCategoryExists = await this.MenuCategoryModel.exists({ _id: new Types.ObjectId(body.selectedCategory), brand: brandID }).exec();
        if (!doesCategoryExists) {
            throw new UnprocessableEntityException([
                { property: "selectedCategory", errors: [I18nContext.current().t("panel.menu.Selected category does not exist")] },
            ]);
        }

        let Has_itemHighlighting = false;
        let Has_menuTagOption = false;
        const brandsPlan = await this.BrandsPlanModel.findOne({ brand: brandID }).populate<{ currentPlan: Plan }>("currentPlan", "_id limitations").exec();
        if (this.PlanService.checkLimitations([["item-highlighting", true]], brandsPlan.currentPlan.limitations)) Has_itemHighlighting = true;
        if (this.PlanService.checkLimitations([["menu-tag-option", true]], brandsPlan.currentPlan.limitations)) Has_menuTagOption = true;

        // add check for every side item group id and only add existing ones
        const sideItems = await this.MenuSideGroupModel.find({ _id: { $in: body.sideItemList }, brand: brandID })
            .select("_id")
            .exec();

        let itemGallery = menuItem.images;
        const newGalleryList = body.galleryList;
        for (let i = 0; i < itemGallery.length; i++) {
            if (newGalleryList.includes(itemGallery[i])) continue;
            await unlink(itemGallery[i].replace("/file/", "storage/public/")).catch((e) => {});
            itemGallery[i] = null;
        }
        itemGallery = itemGallery.filter((image) => image !== null);

        // limit user to upload at max 3 images
        if (itemGallery.length + gallery.length > 3) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("file.max file count is n", { args: { count: 3 } })] }]);
        }

        // upload new images
        const images = await this.FileService.saveUploadedImages(gallery, "", 2 * 1_048_576, ["png", "jpeg", "jpg", "webp"], 320, "public", "/menuItemsImages");
        itemGallery = [...itemGallery, ...images];

        const variants = [];
        for (const variant of body.variants) {
            const variantObj = JSON.parse(variant);
            if (!variantObj.name.values.default) continue;

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

        await this.MenuItemModel.updateOne(
            {
                _id: params.id,
            },
            {
                branches: body.branches || [],
                category: body.selectedCategory,

                images: itemGallery,
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

                sideItems: sideItems.map((group) => group._id),
                tags: [],
                translation: translation,
            },
        ).catch((e) => {
            console.log({ e });
            throw new InternalServerErrorException();
        });

        return res.end();
    }

    @Delete("/:id")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async deleteSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const menuItem = await this.MenuItemModel.findOne({ _id: params.id }).select("_id images").exec();
        if (!menuItem) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }


        // delete menuItem images


        // delete menu item
        await this.MenuItemModel.deleteOne({ _id: params.id }).exec();

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
