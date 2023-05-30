import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { UserDocument } from "src/models/Users.schema";
import { BrandDocument } from "src/models/Brands.schema";
import { BrandsPlan, BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { Plan, PlanDocument } from "src/models/Plans.schema";
import * as humanizeDuration from "humanize-duration";
import { I18nContext } from "nestjs-i18n";

@Controller("panel/billing")
export class BillingController {
    constructor(
        // ...
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("Plan") private readonly PlanModel: Model<PlanDocument>,
    ) {}

    @Get("/current-plan")
    @SetPermissions("main-panel.billing.access")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getCurrentPlan(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        const brandsPlan = await this.BrandsPlanModel.findOne({ brand: brandID })
            .populate<{ currentPlan: Plan }>("currentPlan", "icon name limitations monthlyPrice yearlyPrice translation")
            .exec();
        if (!brandsPlan) throw new NotFoundException();

        let branchLimit = "0";
        let staffLimit = "0";
        for (let i = 0; i < brandsPlan.currentPlan.limitations.length; i++) {
            if (brandsPlan.currentPlan.limitations[i].limit === "branch-limit-count") branchLimit = brandsPlan.currentPlan.limitations[i].value.toString();
            if (brandsPlan.currentPlan.limitations[i].limit === "staff-limit-count") staffLimit = brandsPlan.currentPlan.limitations[i].value.toString();
        }

        // calculating remaining days of current plan
        let daysRemaining = "";
        if (brandsPlan.nextInvoice && brandsPlan.invoiceStartAt) {
            const secondsPassed = brandsPlan.nextInvoice.getTime() - brandsPlan.invoiceStartAt.getTime();
            daysRemaining = humanizeDuration(secondsPassed, { language: I18nContext.current().lang, largest: 1 });
        }

        return res.json({
            currentPlan: {
                plan: { icon: brandsPlan.currentPlan.icon, name: brandsPlan.currentPlan.name, translation: brandsPlan.currentPlan.translation },
                branchLimit: branchLimit,
                staffLimit: staffLimit,
                daysRemaining: daysRemaining,
                price: brandsPlan.period === "monthly" ? brandsPlan.currentPlan.monthlyPrice : brandsPlan.currentPlan.yearlyPrice,
                period: brandsPlan.period,
            },
        });
    }

    // ===============================================
}
