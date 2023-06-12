import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import * as humanizeDuration from "humanize-duration";
import { UserDocument } from "src/models/Users.schema";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { PlanDocument } from "src/models/Plans.schema";
import { PlanChangeRecordDocument } from "src/models/PlanChangeRecords.schema";
import { BranchDocument } from "src/models/Branches.schema";
import { StaffDocument } from "src/models/Staff.schema";
import { ListingDto, gatewayDto, planChangeDto } from "src/dto/panel/billing.dto";
import { I18nContext } from "nestjs-i18n";
import { BillingService } from "src/services/billing.service";
import { BillDocument } from "src/models/Bills.schema";
import { TransactionDocument } from "src/models/Transactions.schema";

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
        @InjectModel("Transaction") private readonly TransactionModel: Model<TransactionDocument>,
    ) {}

    @Get("/current-plan")
    @SetPermissions("main-panel.billing.access")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getCurrentPlan(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();
        return res.json({ currentPlan: await this.billingService.getBrandsCurrentPlan(brandID) });
    }

    // ===============================================

    @Get("/list")
    @SetPermissions("main-panel.billing.access")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getBillingHstory(@Query() query: ListingDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        // sort
        let sort: any = { _id: -1 };

        // the base query object
        let matchQuery: FilterQuery<any> = { brand: new Types.ObjectId(brandID) };
        if (query.lastRecordID) matchQuery = { _id: { $lt: new Types.ObjectId(query.lastRecordID) }, ...matchQuery };

        // making the model with query
        let data = this.BillModel.aggregate();
        data.sort(sort);
        data.match(matchQuery);
        data.lookup({ from: "plans", localField: "plan", foreignField: "_id", as: "plan" });
        data.project({
            _id: 1,
            billNumber: 1,
            type: 1,
            description: 1,
            planPeriod: 1,
            payablePrice: 1,
            secondsAddedToInvoice: 1,
            status: 1,
            dueDate: 1,
            createdAt: 1,
            translation: 1,
            "plan.icon": 1,
            "plan.name": 1,
            "plan.monthlyPrice": 1,
            "plan.yearlyPrice": 1,
            "plan.translation": 1,
        });
        data.limit(Number(query.pp));

        // executing query and getting the results
        let error;
        const exec: any[] = await data.exec().catch((e) => (error = e));
        if (error) throw new InternalServerErrorException();
        const bills: any[] = exec.map((record) => {
            return {
                _id: record._id,
                billNumber: record.billNumber,
                type: record.type,
                description: record.description,
                forHowLong: record.secondsAddedToInvoice
                    ? humanizeDuration(record.secondsAddedToInvoice * 1000, { language: I18nContext.current().lang, largest: 1 })
                    : "",
                planPeriod: record.planPeriod,
                payablePrice: record.payablePrice,
                status: record.status,
                dueDate: record.dueDate,
                createdAt: record.createdAt,
                translation: record.translation,
                plan: record.plan[0],
            };
        });

        const total = await this.BillModel.countDocuments({ brand: brandID }).exec();

        return res.json({ records: bills, total: total });
    }

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

        const fromPlan_fa = currentPlan.plan.translation?.["fa"]?.name || currentPlan.plan.name;
        const fromPlan_en = currentPlan.plan.translation?.["en"]?.name || currentPlan.plan.name;
        const toPlan_fa = selectedPlanRecord.translation?.["fa"]?.name || selectedPlanRecord.name;
        const toPlan_en = selectedPlanRecord.translation?.["en"]?.name || selectedPlanRecord.name;
        const description_fa = `تغییر اشتراک از ${fromPlan_fa} به ${toPlan_fa}`;
        const description_en = `For plan change from ${fromPlan_en} to ${toPlan_en}`;

        if (price > 0) {
            const paymentGateway = this.billingService.getGateway(selectedGateway);
            const identifier = await paymentGateway
                .getIdentifier(price, `${process.env.PAYMENT_CALLBACK_BASE_URL}/${selectedGateway}`, description_fa, user.mobile)
                .catch(() => {
                    throw new UnprocessableEntityException([
                        { property: "", errors: [I18nContext.current().t("panel.billing.failed to retrieve the payment identifier")] },
                    ]);
                });

            const bill = await this.BillModel.create({
                billNumber: await this.billingService.generateBillNumber(),
                type: "planChange",
                description: description_fa,
                creator: req.session.userID,
                brand: brandID,
                plan: selectedPlan,
                planPeriod: selectedPaymentPeriod,
                payablePrice: price,
                status: "pendingPayment",
                secondsAddedToInvoice: extraSeconds,
                createdAt: new Date(Date.now()),
                translation: { en: { description: description_en }, fa: { description: description_fa } },
            });
            await this.TransactionModel.create({
                brand: brandID,
                bill: bill.id,
                user: req.session.userID,
                method: selectedGateway,
                authority: identifier,
                status: "pending",
                createdAt: new Date(Date.now()),
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
            return res.json({ statusCode: "405", message: "MethodNotDefined" });
        }

        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        if (!user) return res.json({ statusCode: "403", message: "ForbiddenUser" });

        const transaction = await this.TransactionModel.findOne({ authority: transactionResponse.identifier }).exec();
        if (!transaction) return res.json({ statusCode: "406", message: "IncorrectIdentifier" });

        const bill = await this.BillModel.findOne({ _id: transaction.bill }).exec();
        if (!transaction) return res.json({ statusCode: "408", message: "IncorrectTransaction", transactionID: transaction._id });

        if (transactionResponse.status !== "OK") {
            await this.billingService.updateBillTransactionRecord(bill.id, transaction._id, "canceled", ip);
            return res.json({ statusCode: "417", message: "TransactionCanceled", transactionID: transaction._id });
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
            return res.json({ statusCode: "412", message: "TransactionFailedAndWillBounce", transactionID: transaction._id });
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

        // after successful payable downgrade/upgrade (that extends the invoice time) any renewal bill will be canceled
        if (bill.secondsAddedToInvoice > 0) await this.BillModel.updateOne({ brand: bill.brand, type: "renewal" }, { status: "canceled" }).exec();

        return res.json({ statusCode: "200", message: "SuccessfulPayment", transactionID: transaction._id });
    }

    // TODO
    // factor will be generated 4 days before remaining days ending
    // if any brandPlan invoice time passes the current time, then that brand should be blocked to do anything until they pay up or convert to basic plan
}
