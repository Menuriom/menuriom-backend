import { Body, Controller, Get, Post, Req, Res, NotFoundException } from "@nestjs/common";
import { Request, Response } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { BranchDocument } from "src/models/Branches.schema";
import { BrandDocument } from "src/models/Brands.schema";
import { MenuSytleDocument } from "src/models/MenuStyles.schema";
import { MenuCategoryDocument } from "src/models/MenuCategories.schema";
import { MenuItemDocument } from "src/models/MenuItems.schema";
import { MenuSideGroup } from "src/models/MenuSideGroups.schema";
import { WorkingHourDocument } from "src/models/WorkingHours.schema";

@Controller("menu-info")
export class MenuInfoController {
    constructor(
        // ...
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("MenuStyle") private readonly MenuSytleModel: Model<MenuSytleDocument>,
        @InjectModel("MenuCategory") private readonly MenuCategoryModel: Model<MenuCategoryDocument>,
        @InjectModel("MenuItem") private readonly MenuItemModel: Model<MenuItemDocument>,
        @InjectModel("WorkingHour") private readonly WorkingHourModel: Model<WorkingHourDocument>,
    ) {}

    @Get("/menu-styles")
    async loadMenuStyles(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandUsername = req.headers["brand"];
        const brand = await this.BrandModel.findOne({ username: brandUsername, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
            .select("_id")
            .exec();
        if (!brand) throw new NotFoundException();

        const menuStyles = await this.MenuSytleModel.findOne({ brand: brand._id })
            .select("baseColors mainMenuStyleOptions itemsDialogStyleOptions restaurantDetailsPageOptions splashScreenOptions")
            .lean();

        // calculate shadowLVL for base bgMainColor
        // if the bgMainColor is different for any of other colors then calc shadowLVL for that color
        // else set the shadowLVL the same as base shadow level
        
        // menuStyles.baseColors.bgMainColor;
        // menuStyles.mainMenuStyleOptions.headerOptions.bgMainColor;
        // menuStyles.mainMenuStyleOptions.suggestionsOptions.bgMainColor;
        // menuStyles.mainMenuStyleOptions.searchOptions.bgMainColor;
        // menuStyles.mainMenuStyleOptions.categoriesOptions.bgMainColor;
        // menuStyles.mainMenuStyleOptions.itemHeaderOptions.bgMainColor;
        // menuStyles.mainMenuStyleOptions.itemListOptions.bgMainColor;
        // menuStyles.mainMenuStyleOptions.navbarOptions.bgMainColor;
        // menuStyles.itemsDialogStyleOptions.bgMainColor;
        // menuStyles.restaurantDetailsPageOptions.bgMainColor;
        // menuStyles.splashScreenOptions.bgMainColor;

        return res.json({ menuStyles });
    }

    @Get("/restaurant-info")
    async loadRestaurantInfo(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandUsername = req.headers["brand"];

        const brand = await this.BrandModel.findOne({ username: brandUsername }).select("logo name slogan socials languages currency translation").lean();
        if (!brand) throw new NotFoundException();

        const branches = await this.BranchModel.find({ brand: brand._id }).select("name address telephoneNumbers gallery translation").lean();
        const workingHours = await this.WorkingHourModel.findOne({ brand: brand._id }).select("workingHours").lean();

        const orderedHours = {};
        for (const branch in workingHours.workingHours || {}) {
            const days = workingHours.workingHours[branch];
            if (!orderedHours[branch]) orderedHours[branch] = {};

            let branchHoursSet = false;

            for (const dayName in days) {
                const day = days[dayName];
                const clock = day.from && day.to ? `${day.from} -> ${day.to}` : "";
                if (day.open) branchHoursSet = true;

                if (!orderedHours[branch][`${clock} - ${day.open}`]) {
                    orderedHours[branch][`${clock} - ${day.open}`] = { days: [dayName], clock: clock, open: day.open };
                } else {
                    orderedHours[branch][`${clock} - ${day.open}`].days.push(dayName);
                }
            }

            if (!branchHoursSet && branch !== "all") delete orderedHours[branch];
        }

        return res.json({ brand, branches, workingHours: orderedHours });
    }

    @Get("/menu-categories")
    async getMenuCategories(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandUsername = req.headers["brand"];
        const brand = await this.BrandModel.findOne({ username: brandUsername, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
            .select("_id")
            .exec();
        if (!brand) throw new NotFoundException();

        const categories = await this.MenuCategoryModel.find({ brand: brand._id, hidden: false })
            .select("icon name description order showAsNew translation")
            .sort({ order: "asc" })
            .lean();

        return res.json({ categories });
    }

    @Get("/menu-items")
    async getMenuItems(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandUsername = req.headers["brand"];
        const brand = await this.BrandModel.findOne({ username: brandUsername, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
            .select("_id")
            .exec();
        if (!brand) throw new NotFoundException();

        const menuCategories = await this.MenuCategoryModel.find({ brand: brand._id, hidden: false })
            .select("branches icon name description order showAsNew translation")
            .sort({ order: "asc" })
            .lean();
        const menuItems = await this.MenuItemModel.find({ brand: brand._id, hidden: false })
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

    @Get("/menu-item/:id")
    async getSingleMenuItem(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandUsername = req.headers["brand"];
        const brand = await this.BrandModel.findOne({ username: brandUsername, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
            .select("_id")
            .exec();
        if (!brand) throw new NotFoundException();

        let itemId: Types.ObjectId | string = "";
        try {
            itemId = new Types.ObjectId(req.params.id.toString());
        } catch (e) {
            throw new NotFoundException();
        }

        const menuItem = await this.MenuItemModel.findOne({ _id: itemId, brand: brand._id, hidden: false })
            .select(
                "branches category order images name description price discountPercentage discountActive variants pinned soldOut showAsNew specialDaysList specialDaysActive tags sideItems likes translation",
            )
            .populate<{ sideItems: MenuSideGroup }>("sideItems", "name description items maxNumberUserCanChoose translation")
            .lean();

        return res.json(menuItem);
    }
}
