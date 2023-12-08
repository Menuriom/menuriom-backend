import { Body, Param, Query, Controller, Get, UseGuards, Post, Put, Req, Res } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { BranchDocument } from "src/models/Branches.schema";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { StaffDocument } from "src/models/Staff.schema";
import { MenuItemDocument } from "src/models/MenuItems.schema";
import { AnalyticDocument } from "src/models/Analytics.schema";
import { BillingService } from "src/services/billing.service";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import * as jalaali from "jalaali-js";
import { Plan } from "src/models/Plans.schema";

@Controller("panel/analytics")
export class AnalyticsController {
    constructor(
        // ...
        private readonly billingService: BillingService,
        @InjectModel("Analytic") private readonly AnalyticModel: Model<AnalyticDocument>,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
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

    @Get("/qr-scans")
    @SetPermissions("main-panel")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getQrScans(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        const todayDateDigest = new Intl.DateTimeFormat("en-UK").format(Date.now()).split("/");
        const thisMonthDate = new Date(`${todayDateDigest[2]}-${todayDateDigest[1]}-01T12:00:00Z`);
        const lastMonthDateDigest = new Intl.DateTimeFormat("en-UK").format(Date.now() - 3_600_000 * 24 * 30).split("/");
        const lastMonthDate = new Date(`${lastMonthDateDigest[2]}-${lastMonthDateDigest[1]}-01T12:00:00Z`);

        const lastMonth: any = (await this.AnalyticModel.findOne({ brand: brandID, type: "monthly", name: "qrScans", date: lastMonthDate }).exec()) || {};
        const thisMonth: any = (await this.AnalyticModel.findOne({ brand: brandID, type: "monthly", name: "qrScans", date: thisMonthDate }).exec()) || {};
        const thisMonthUniqueCount = thisMonth.uniqueCount || 0;
        const lastMonthUniqueCount = lastMonth.uniqueCount || 0;
        const thisMonthCount = thisMonth.count || 0;
        const lastMonthCount = lastMonth.count || 0;

        const unqiueGrowth = lastMonthUniqueCount ? (thisMonthUniqueCount - lastMonthUniqueCount) / lastMonthUniqueCount : 0;
        const totalGrowth = lastMonthCount ? (thisMonthCount - lastMonthCount) / lastMonthCount : 0;

        const monthlyTotalCounts = [];
        const monthlyUniqueCounts = [];
        const monthlyLabel = [];
        const dailyTotalCounts = [];
        const dailyUniqueCounts = [];
        const dailyLabel = [];
        // if user is standard and above get the list of daily scans up to a month and monthly scans for past 12 months
        const brandsPlan = await this.BrandsPlanModel.findOne({ brand: brandID }).populate<{ currentPlan: Plan }>("currentPlan", "code name").exec();
        if (brandsPlan.currentPlan.code > 0) {
            const monthlyDateDigest = new Intl.DateTimeFormat("en-UK").format(Date.now() - 3_600_000 * 24 * 356).split("/");

            const monthlyPeriodStart = new Date(`${monthlyDateDigest[2]}-${monthlyDateDigest[1]}-01T12:00:00Z`);
            const monthlyPeriodEnd = thisMonthDate;
            const dailyPeriodStart = new Date(`${lastMonthDateDigest[2]}-${lastMonthDateDigest[1]}-${lastMonthDateDigest[0]}T12:00:00Z`);
            const dailyPeriodEnd = new Date(`${todayDateDigest[2]}-${todayDateDigest[1]}-${todayDateDigest[0]}T12:00:00Z`);

            const monthlyRecords = await this.AnalyticModel.find({
                brand: brandID,
                type: "monthly",
                name: "qrScans",
                date: { $gte: monthlyPeriodStart, $lte: monthlyPeriodEnd },
            }).exec();
            monthlyRecords.forEach((record) => {
                monthlyTotalCounts.push(record.count);
                monthlyUniqueCounts.push(record.uniqueCount);
                monthlyLabel.push(new Intl.DateTimeFormat("fa", { calendar: "persian", year: "numeric", month: "short" }).format(record.date));
            });

            const dailyRecords = await this.AnalyticModel.find({
                brand: brandID,
                type: "daily",
                name: "qrScans",
                date: { $gte: dailyPeriodStart, $lte: dailyPeriodEnd },
            }).exec();
            dailyRecords.forEach((record) => {
                dailyTotalCounts.push(record.count);
                dailyUniqueCounts.push(record.uniqueCount);
                dailyLabel.push(new Intl.DateTimeFormat("fa", { calendar: "persian", year: "numeric", month: "short" }).format(record.date));
            });
        }

        return res.json({
            thisMonthUniqueCount,
            lastMonthUniqueCount,
            thisMonthCount,
            lastMonthCount,
            unqiueGrowth: (unqiueGrowth * 100).toFixed(Math.abs(unqiueGrowth * 100) > 1 ? 0 : 2),
            totalGrowth: (totalGrowth * 100).toFixed(Math.abs(totalGrowth * 100) > 1 ? 0 : 2),
            monthlyTotalCounts,
            monthlyUniqueCounts,
            monthlyLabel,
            dailyTotalCounts,
            dailyUniqueCounts,
            dailyLabel,
        });
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
