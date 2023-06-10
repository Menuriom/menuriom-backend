import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { UserDocument } from "src/models/Users.schema";
import { BrandsPlan, BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { Plan, PlanDocument } from "src/models/Plans.schema";
import { PlanChangeRecordDocument } from "src/models/PlanChangeRecords.schema";
import { BranchDocument } from "src/models/Branches.schema";
import { StaffDocument } from "src/models/Staff.schema";
import { gatewayDto, planChangeDto } from "src/dto/panel/billing.dto";
import { I18nContext } from "nestjs-i18n";
import { BillingService } from "src/services/billing.service";
import { BillDocument } from "src/models/Bills.schema";

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
        @InjectModel("PlanChangeRecord") private readonly PlanChangeRecordModel: Model<PlanChangeRecordDocument>,
        @InjectModel("Bill") private readonly BillModel: Model<BillDocument>,
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
    @UseGuards(AuthorizeUserInSelectedBrand)
    async planChange(@Body() body: planChangeDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();
        const selectedGateway = body.selectedGateway || "zarinpal";
        const selectedPlan = body.selectedPlan;
        const selectedPaymentPeriod = body.selectedPaymentPeriod || "monthly";
        let type = "";
        let url = "";

        // TODO
        // check if user is downgrading and dont allow until the limit is reached

        const plan = await this.PlanModel.findOne({ _id: selectedPlan }).exec();
        if (!plan) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.billing.the plan you selected is not available right now")] },
            ]);
        }

        const currentPlan = await this.billingService.getBrandsCurrentPlan(brandID);
        const { calculatedPrice: price, extraSeconds } = await this.billingService.calculatePriceAndExtraSeconds(currentPlan, plan, selectedPaymentPeriod);

        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        const selectedPlanRecord = await this.PlanModel.findOne({ _id: selectedPlan }).exec();

        if (price > 0) {
            const description_fa = `تغییر اشتراک از ${currentPlan.plan.translation["fa"].name} به ${selectedPlanRecord.translation["fa"].name}`;
            const description_en = `For plan change from ${currentPlan.plan.translation["en"].name} to ${selectedPlanRecord.translation["en"].name}`;

            const paymentGateway = this.billingService.getGateway(selectedGateway);
            const identifier = await paymentGateway
                .getIdentifier(price, `${process.env.PAYMENT_CALLBACK_BASE_URL}/${selectedGateway}`, description_fa, user.mobile)
                .catch(() => {
                    throw new UnprocessableEntityException([
                        { property: "", errors: [I18nContext.current().t("panel.billing.failed to retrieve the payment identifier")] },
                    ]);
                });

            await this.BillModel.create({
                billNumber: this.billingService.generateBillNumber(),
                type: "planChange",
                description: description_fa,
                creator: req.session.userID,
                brand: brandID,
                plan: selectedPlan,
                payablePrice: price,
                status: "pendingPayment",
                secondsAddedToInvoice: extraSeconds,
                transactions: [{ user: req.session.userID, method: selectedGateway, authority: identifier, status: "pending", createdAt: new Date(Date.now()) }],
                createdAt: new Date(Date.now()),
                translation: { en: { description: description_en }, fa: { description: description_fa } },
            });

            type = "withPayment";
            url = paymentGateway.getGatewayUrl(identifier);
        } else {
            await this.BrandsPlanModel.updateOne(
                { brand: brandID },
                { currentPlan: selectedPlan, period: selectedPaymentPeriod, startTime: new Date(Date.now()) },
            ).exec();

            // keep record of plan changes
            await this.PlanChangeRecordModel.create({
                brand: brandID,
                user: req.session.userID,
                previusPlan: currentPlan.plan._id,
                newPlan: selectedPlan,
                previusPeriod: currentPlan.period,
                newPeriod: selectedPaymentPeriod,
                createdAt: new Date(Date.now()),
            });

            type = "planChanged";
        }

        return res.json({ type, url });
    }

    @Get("plan-change-payment-callback/:method")
    async planChangeCallback(@Param() param: gatewayDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const ip: string = req.headers["x-forwarded-for"].toString() || "";
        const paymentGateway = this.billingService.getGateway(param.method);
        const transactionResponse = paymentGateway.getTransactionResponse(req);
        if (transactionResponse.identifier === "") {
            // TODO : log the error
            return res.json({ errorCode: "405", errorMessage: "MethodNotDefined" });
        }

        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        if (!user) return res.json({ errorCode: "403", errorMessage: "ForbiddenUser" });

        const bill = await this.BillModel.findOne({ "transactions.authority": transactionResponse.identifier }).exec();
        if (!bill) {
            // TODO : Log the incorrect authority
            return res.json({ errorCode: "406", errorMessage: "IncorrectIdentifier" });
        }

        const transaction = bill.transactions.filter((transaction) => transaction.authority === transactionResponse.identifier).at(0);

        if (transactionResponse.status !== "OK") {
            await this.billingService.updateBillTransactionRecord(bill.id, transaction._id, "canceled", ip);
            return res.json({ errorCode: "417", errorMessage: "TransactionCanceled" });
        }

        let verficationResponse = null;
        const transactionVerified = await paymentGateway
            .verify(transactionResponse.identifier, bill.payablePrice)
            .then((response) => {
                verficationResponse = response;
                if (response.status > 0) return true;
                return false;
            })
            .catch(async (error) => {
                const errorText = error.response ? error.response : error;
                await this.billingService.updateBillTransactionRecord(bill.id, transaction._id, "error", ip, errorText);
                return false;
            });

        if (!transactionVerified) {
            // TODO : Log the error
            return res.json({ errorCode: "412", errorMessage: "TransactionFailedAndWillBounce" });
        }

        // mark the bill as paid and transaction record
        await this.BillModel.updateOne({ _id: bill.id }, { status: "paid" }).exec();
        await this.billingService.updateBillTransactionRecord(bill.id, transaction._id, "ok", ip, "", verficationResponse.transactionCode, bill.payablePrice);

        const brandCurrentPlan = await this.BrandsPlanModel.findOne({ brand: bill.brand }).exec();
        const nextInvoiceInSeconds = brandCurrentPlan.nextInvoice ? brandCurrentPlan.nextInvoice.getTime() / 1000 : Date.now() / 1000;

        // update the invoice dates and brand's plan
        await this.BrandsPlanModel.updateOne(
            { brand: bill.brand },
            {
                currentPlan: bill.plan,
                period: bill.planPeriod,
                startTime: new Date(Date.now()),
                nextInvoice: new Date((nextInvoiceInSeconds + bill.secondsAddedToInvoice) * 1000),
            },
        ).exec();

        // keep record of plan changes
        await this.PlanChangeRecordModel.create({
            brand: bill.brand,
            user: req.session.userID,
            previusPlan: brandCurrentPlan.currentPlan,
            newPlan: bill.plan,
            previusPeriod: brandCurrentPlan.period,
            newPeriod: bill.planPeriod,
            createdAt: new Date(Date.now()),
        });

        if (bill.secondsAddedToInvoice > 0) {
            // after successful payable downgrade/upgrade any renewal bill will be canceled
            await this.BillModel.updateOne({ brand: bill.brand, type: "renewal" }, { status: "canceled" }).exec();
        }

        return res.json({ redirectUrl: "/purchase-result?status=200&message=Success" });
    }

    // TODO
    // factor will be generated 4 days before remaining days ending
}
