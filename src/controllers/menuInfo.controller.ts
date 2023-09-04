import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { BranchDocument } from "src/models/Branches.schema";
import { BrandDocument } from "src/models/Brands.schema";
import { MenuSytleDocument } from "src/models/MenuStyles.schema";
import { MenuCategoryDocument } from "src/models/MenuCategories.schema";
import { MenuItemDocument } from "src/models/MenuItems.schema";
import { MenuSideGroup } from "src/models/MenuSideGroups.schema";

@Controller("menu-info")
export class MenuInfoController {
    constructor(
        // ...
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("MenuStyle") private readonly MenuSytleModel: Model<MenuSytleDocument>,
        @InjectModel("MenuCategory") private readonly MenuCategoryModel: Model<MenuCategoryDocument>,
        @InjectModel("MenuItem") private readonly MenuItemModel: Model<MenuItemDocument>,
    ) {}

    @Get("/menu-styles")
    async loadMenuStyles(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const menuStyles = await this.MenuSytleModel.findOne({ brand: brandID })
            .select("baseColors mainMenuStyleOptions itemsDialogStyleOptions restaurantDetailsPageOptions splashScreenOptions")
            .lean();

        return res.json({ menuStyles });
    }

    @Get("/restaurant-info")
    async loadRestaurantInfo(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const brand = await this.BrandModel.findOne({ _id: brandID }).select("logo name slogan socials languages currency translation").lean();
        const branches = await this.BranchModel.find({ brand: brandID }).select("name address telephoneNumbers gallery translation").lean();

        return res.json({ brand, branches });
    }

    @Get("/menu-categories")
    async getMenuCategories(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        // TODO
        // get menu base on brand and selected branch

        const categories = await this.MenuCategoryModel.find({ brand: brandID, hidden: false })
            .select("icon name description order showAsNew translation")
            .sort({ order: "asc" })
            .lean();

        return res.json({ categories });
    }

    @Get("/menu-items")
    async getMenuItems(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        // TODO
        // get menu base on brand and selected branch

        const menuCategories = await this.MenuCategoryModel.find({ brand: brandID, hidden: false })
            .select("branches icon name description order showAsNew translation")
            .sort({ order: "asc" })
            .lean();
        const menuItems = await this.MenuItemModel.find({ brand: brandID, hidden: false })
            .select(
                "branches category order images name description price discountPercentage discountActive variants pinned soldOut showAsNew specialDaysList specialDaysActive tags sideItems likes translation",
            )
            .sort({ order: "asc" })
            .populate<{ sideItems: MenuSideGroup }>("sideItems", "name description items maxNumberUserCanChoose translation")
            .lean();

        const results = {};
        for (const category of menuCategories) results[category._id] = { ...category, items: [] };
        for (const item of menuItems) results[item.category.toString()].items.push(item);

        return res.json(Object.values(results));
    }
}
