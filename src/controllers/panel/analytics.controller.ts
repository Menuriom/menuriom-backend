import { Body, Param, Query, Controller, Get, UseGuards, Post, Put, Req, Res } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { BranchDocument } from "src/models/Branches.schema";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import * as jalaali from "jalaali-js";
import { StaffDocument } from "src/models/Staff.schema";
import { MenuItemDocument } from "src/models/MenuItems.schema";
import { AnalyticDocument } from "src/models/Analytics.schema";
import { BillingService } from "src/services/billing.service";

@Controller("panel/analytics")
export class AnalyticsController {
    constructor(
        // ...
        private readonly billingService: BillingService,
        @InjectModel("Analytic") private readonly AnalyticModel: Model<AnalyticDocument>,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("MenuItem") private readonly MenuItemModel: Model<MenuItemDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
    ) {}

    // TODO : order
    // save the income and order count daily and monthly

    // TODO : registers
    // save user registers monthly for standard and above

    @Get("/basic-counts")
    @SetPermissions("main-panel")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getBasicCounts(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const results = await Promise.all([
            this.BranchModel.countDocuments({ brand: brandID }).exec(),
            this.MenuItemModel.countDocuments({ brand: brandID }).exec(),
            this.StaffModel.countDocuments({ brand: brandID }).exec(),
        ]);

        return res.json({ branches: results[0], menuItems: results[1], staff: results[2] });
    }

    @Get("/best-of")
    @SetPermissions("main-panel")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getBestOf(@Query() query, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        let dateDigest: Array<string>;
        let periodStart: Date;
        let periodEnd: Date;
        switch (query.period) {
            case "ThisMonth":
                dateDigest = new Intl.DateTimeFormat("en-UK").format(Date.now()).split("/");
                periodStart = new Date(`${dateDigest[2]}-${dateDigest[1]}-01T12:00:00Z`);
                periodEnd = new Date(Date.now());
                break;
            case "LastMonth":
                dateDigest = new Intl.DateTimeFormat("en-UK").format(Date.now() - 3_600_000 * 24 * 30).split("/");
                periodStart = new Date(`${dateDigest[2]}-${dateDigest[1]}-01T12:00:00Z`);
                periodEnd = new Date(`${dateDigest[2]}-${dateDigest[1]}-28T12:00:00Z`);
                break;
            case "ThisYear":
                dateDigest = new Intl.DateTimeFormat("en-UK").format(Date.now()).split("/");
                periodStart = new Date(`${dateDigest[2]}-01-01T12:00:00Z`);
                periodEnd = new Date(Date.now());
                break;
        }

        let name: string;
        switch (query.tab) {
            case "MostViewed":
                name = "itemViews";
                break;
            case "MostOrdered":
                name = "orders";
                break;
            case "MostLiked":
                name = "likes";
                break;
        }

        const AggQuery = this.AnalyticModel.aggregate();
        AggQuery.match({ brand: new Types.ObjectId(brandID), name: name, type: "monthly", date: { $gte: periodStart, $lte: periodEnd } });
        AggQuery.group({
            _id: { brand: "$brand", menuItem: "$menuItem" },
            totalCount: { $sum: "$count" },
            date: { $last: "$date" },
        });
        AggQuery.sort({ totalCount: -1 });
        AggQuery.limit(10);

        const results = await AggQuery.exec().catch((e) => {
            console.log(e);
            throw new InternalServerErrorException();
        });

        const menuIds = results.map((row) => row._id.menuItem);
        const menuItems = await this.MenuItemModel.find({ _id: { $in: menuIds } })
            .select("_id name images")
            .exec();
        const menuItemsFormatted = {};
        menuItems.forEach((item) => (menuItemsFormatted[item._id] = { name: item.name, images: item.images }));

        const formattedResults = results.map((row) => {
            row.menuItem = menuItemsFormatted[row._id.menuItem];
            delete row._id;
            return row;
        });

        return res.json([...formattedResults]);
    }

    @Get("/current-plan")
    @SetPermissions("main-panel")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getCurrentPlan(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();
        return res.json({ ...(await this.billingService.getBrandsCurrentPlan(brandID)) });
    }

    @Get("/")
    @SetPermissions("main-panel")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async get2(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const date = new Intl.DateTimeFormat("en-UK").format(Date.now());
        const dateDigest = date.split("/");

        console.log({
            date: date,
            today: `${dateDigest[2]}-${dateDigest[1]}-${dateDigest[0]}`,
            thisMonth: `${dateDigest[2]}-${dateDigest[1]}-00`,
            // G2J: new Intl.DateTimeFormat("fa", { calendar: "persian", numberingSystem: "latn" }).format(date),
            // J2G: jalaali.toGregorian(1402, 10, 10),
        });

        return res.json({});
    }
}
