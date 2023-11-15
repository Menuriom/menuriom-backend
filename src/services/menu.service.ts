import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { unlink } from "fs/promises";
import { Model } from "mongoose";
import { Branch, BranchDocument } from "src/models/Branches.schema";
import { Brand, BrandDocument } from "src/models/Brands.schema";
import { MenuCategory, MenuCategoryDocument } from "src/models/MenuCategories.schema";
import { MenuItem, MenuItemDocument } from "src/models/MenuItems.schema";
import { MenuSideGroup } from "src/models/MenuSideGroups.schema";
import { MenuSytle, MenuSytleDocument } from "src/models/MenuStyles.schema";
import { WorkingHourDocument } from "src/models/WorkingHours.schema";

@Injectable()
export class MenuService {
    constructor(
        // ...
        @InjectModel("MenuStyle") private readonly MenuSytleModel: Model<MenuSytleDocument>,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("WorkingHour") private readonly WorkingHourModel: Model<WorkingHourDocument>,
        @InjectModel("MenuCategory") private readonly MenuCategoryModel: Model<MenuCategoryDocument>,
        @InjectModel("MenuItem") private readonly MenuItemModel: Model<MenuItemDocument>,
    ) {}

    async removeCategoryCustomIcons(menuCategoryIcon: string): Promise<void> {
        if (menuCategoryIcon && menuCategoryIcon.includes("customCategoryIcons")) {
            unlink(menuCategoryIcon.replace("/file/", "storage/public/")).catch((e) => {});
        }
    }

    async loadMenuStyles(brandID: string): Promise<{ menuStyles: MenuSytle }> {
        const menuStyles = await this.MenuSytleModel.findOne({ brand: brandID })
            .select("baseColors mainMenuStyleOptions itemsDialogStyleOptions restaurantDetailsPageOptions splashScreenOptions")
            .lean();

        return { menuStyles };
    }

    async loadRestaurantInfo(brandID: string): Promise<{
        branches: Branch[];
        workingHours: { [key: string]: { [key: string]: { days: String[]; clock: String; open: Boolean } } };
    }> {
        const branches = await this.BranchModel.find({ brand: brandID }).select("name address telephoneNumbers gallery translation").lean();
        const workingHours = await this.WorkingHourModel.findOne({ brand: brandID }).select("workingHours").lean();

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

        return { branches, workingHours: orderedHours };
    }

    async loadMenuItems(brandID: string): Promise<(MenuCategory & { items: MenuItem[] })[]> {
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

        return Object.values(results);
    }
}
