import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UseInterceptors, UploadedFile } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { UserDocument } from "src/models/Users.schema";
import { I18nContext } from "nestjs-i18n";
import { BillDocument } from "src/models/Bills.schema";
import { TransactionDocument } from "src/models/Transactions.schema";
import { IdDto } from "src/dto/general.dto";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { ListingDto } from "src/dto/panel/billing.dto";
import { MenuCategoryDocument } from "src/models/MenuCategories.schema";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { CreateNewCategoryDto } from "src/dto/panel/menuCategory.dto";
import { BrandDocument } from "src/models/Brands.schema";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";

@Controller("panel/menu-categories")
export class MenuCategoriesController {
    constructor(
        // ...
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
        const category = await this.MenuCategoryModel.findOne({ _id: params.id }).exec();
        if (!category) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        return res.json({ category });
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
        // TODO
        // max category hard limit is 100
        // check the icon mode
        // base on icon mode check the limitation that if user can upload custom icons or not
        // create new category

        const brandID = req.headers["brand"];
        const brand = await this.BrandModel.findOne({ _id: brandID }).exec();
        const brandsPlan = await this.BrandsPlanModel.findOne({ brand: brandID }).exec();


        return res.end();
    }

    @Put("/:id")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    @UseInterceptors(FilesInterceptor("gallery"))
    async editRecord(
        @UploadedFile() gallery: Express.Multer.File[],
        @Param() params: IdDto,
        @Body() body,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        return res.json({});
    }

    @Delete("/:id")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async deleteSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const category = await this.MenuCategoryModel.findOne({ _id: params.id }).select("logo name slogan").exec();
        if (!category) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        // delete branch
        await this.MenuCategoryModel.deleteOne({ _id: params.id }).exec();
        // TODO : delete category custom image
        // TODO : delete all category items
        // TODO : delete category from branch menus

        return res.end();
    }
}
