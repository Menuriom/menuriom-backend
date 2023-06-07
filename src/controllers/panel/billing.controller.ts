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
import { BranchDocument } from "src/models/Branches.schema";
import { StaffDocument } from "src/models/Staff.schema";
import { planChangeDto } from "src/dto/panel/billing.dto";
import * as humanizeDuration from "humanize-duration";
import { I18nContext } from "nestjs-i18n";
import { BillingService } from "src/services/billing.service";

@Controller("panel/billing")
export class BillingController {
    constructor(
        // ...
        private readonly billingService: BillingService,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
        @InjectModel("Plan") private readonly PlanModel: Model<PlanDocument>,
    ) {}

    @Get("/current-plan")
    @SetPermissions("main-panel.billing.access")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getCurrentPlan(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();
        return res.json({ currentPlan: await this.billingService.getBrandsCurrentPlan(brandID) });
    }

    // ===============================================

    @Post("/plan-change")
    @SetPermissions("main-panel.billing.change-plan")
    async planChange(@Body() body: planChangeDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();
        const selectedGateway = body.selectedGateway || "zarinpal";
        const selectedPlan = body.selectedPlan;
        const selectedPaymentPeriod = body.selectedPaymentPeriod || "monthly";

        // TODO
        // check if user is downgrading and dont allow until the limit is reached

        const plan = await this.PlanModel.findOne({ _id: selectedPlan }).exec();
        if (!plan) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.billing.the plan you selected is not available right now")] },
            ]);
        }

        const currentPlan = await this.billingService.getBrandsCurrentPlan(brandID);
        const price = await this.billingService.calculatePrice(currentPlan, plan, selectedPaymentPeriod);

        if (price > 0) {
            // TODO
            // ... generate a plan change factor
            // ... send the gateway link
        } else {
            // TODO
            // if its not payable
            // ... change the plan right away
        }

        // TODO
        // save the successful plan change records some where (who did it, from what plan to what, in what time, old invoice info and days remaining and such)
    }

    @Get("plan-change/:method")
    async planChangeCallback(@Req() req: Request, @Res() res: Response): Promise<void | Response> {}

    // TODO
    // factor will be generated 4 days before remaining days ending
}
