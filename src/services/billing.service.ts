import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { StaffDocument } from "src/models/Staff.schema";
import { BranchDocument } from "src/models/Branches.schema";
import { BrandsPlan, BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { Plan, PlanDocument } from "src/models/Plans.schema";
import * as humanizeDuration from "humanize-duration";
import { I18nContext } from "nestjs-i18n";
import { GatewayInterface } from "src/interfaces/Gateway";
import { ZarinpalGateway } from "src/paymentGateways/zarinpal.payment";
import { WalletGateway } from "src/paymentGateways/wallet.payment";
import { Bill, BillDocument } from "src/models/Bills.schema";
import { TransactionDocument } from "src/models/Transactions.schema";
import { PlanChangeRecordDocument } from "src/models/PlanChangeRecords.schema";
import { BrandDocument } from "src/models/Brands.schema";

@Injectable()
export class BillingService {
    constructor(
        // ...
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Plan") private readonly PlanModel: Model<PlanDocument>,
        @InjectModel("Bill") private readonly BillModel: Model<BillDocument>,
        @InjectModel("PlanChangeRecord") private readonly PlanChangeRecordModel: Model<PlanChangeRecordDocument>,
        @InjectModel("Transaction") private readonly TransactionModel: Model<TransactionDocument>,
    ) {}

    async calculatePriceAndExtraSeconds(
        currentPlan: CurrentPlan,
        selectedPlan: Plan,
        selectedPaymentPeriod: "monthly" | "yearly",
    ): Promise<{ calculatedPrice: number; extraSeconds: number }> {
        let calculatedPrice: number = 0;
        let extraSeconds: number = 0;
        const devider = selectedPaymentPeriod === "monthly" ? 30 : 365;
        const remainingDays = currentPlan.secondsPassed ? Math.floor(Number(currentPlan.secondsPassed) / (3600 * 24)) : Infinity;

        const purchasablePlans = await this.PlanModel.find().select("_id icon name desc limitations listings monthlyPrice yearlyPrice translation").exec();

        if (currentPlan.plan.name === purchasablePlans[0].name) {
            calculatedPrice = selectedPlan[`${selectedPaymentPeriod}Price`];
            extraSeconds = devider * 24 * 60 * 60;
        }

        if (currentPlan.plan.name === purchasablePlans[1].name) {
            if (remainingDays <= 5) {
                calculatedPrice = selectedPlan[`${selectedPaymentPeriod}Price`];
                extraSeconds = devider * 24 * 60 * 60;
            } else {
                if (selectedPlan.name === purchasablePlans[2].name) {
                    const diff = purchasablePlans[2][`${selectedPaymentPeriod}Price`] - purchasablePlans[1][`${selectedPaymentPeriod}Price`];
                    calculatedPrice = Math.floor((diff * remainingDays) / devider);
                }
            }
        }

        if (currentPlan.plan.name === purchasablePlans[2].name && remainingDays <= 5) {
            calculatedPrice = selectedPlan[`${selectedPaymentPeriod}Price`];
            extraSeconds = devider * 24 * 60 * 60;
        }

        return { calculatedPrice, extraSeconds };
    }

    async downgradeLimitCheck(brandID: string, selectedPlan: Plan): Promise<void> {
        let langLimit: number;
        let branchLimit: number;
        let staffLimit: number;
        selectedPlan.limitations.forEach((item) => {
            if (item.limit == "multiple-language-limit") langLimit = Number(item.value);
            if (item.limit == "branch-limit-count") branchLimit = Number(item.value);
            if (item.limit == "staff-limit-count") staffLimit = Number(item.value);
        });
        staffLimit = staffLimit * branchLimit;

        const langCount = (await this.BrandModel.findOne({ _id: brandID }).select("languages").exec()).languages.length;
        const branchCount = await this.BranchModel.countDocuments({ brand: brandID }).exec();
        const staffCount = await this.StaffModel.countDocuments({ brand: brandID }).exec();

        if (langCount > langLimit) {
            const n = langCount - langLimit;
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.billing.tooMuchLangs", { args: { n } })] }]);
        }
        if (branchCount > branchLimit) {
            const n = branchCount - branchLimit;
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.billing.tooMuchBranch", { args: { n } })] }]);
        }
        if (staffCount > staffLimit) {
            const n = staffCount - staffLimit;
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.billing.tooMuchStaff", { args: { n } })] }]);
        }
    }

    async getBrandsCurrentPlan(brandID: string): Promise<CurrentPlan> {
        const brandsPlan = await this.BrandsPlanModel.findOne({ brand: brandID })
            .populate<{ currentPlan: Plan }>("currentPlan", "_id icon name code limitations monthlyPrice yearlyPrice translation")
            .exec();
        if (!brandsPlan) throw new NotFoundException();

        const branchCount = await this.BranchModel.countDocuments({ brand: brandID }).exec();
        const staffCount = await this.StaffModel.countDocuments({ brand: brandID }).exec();

        let branchLimit = "0";
        let staffLimit = "0";
        for (let i = 0; i < brandsPlan.currentPlan.limitations.length; i++) {
            if (brandsPlan.currentPlan.limitations[i].limit === "branch-limit-count") branchLimit = brandsPlan.currentPlan.limitations[i].value.toString();
            if (brandsPlan.currentPlan.limitations[i].limit === "staff-limit-count") staffLimit = brandsPlan.currentPlan.limitations[i].value.toString();
        }

        // calculating remaining days of current plan
        let daysRemaining = null;
        let secondsPassed = Infinity;
        if (brandsPlan.nextInvoice) {
            secondsPassed = brandsPlan.nextInvoice.getTime() - Date.now();
            daysRemaining = humanizeDuration(secondsPassed, { language: I18nContext.current().lang, largest: 1 });
        }

        return {
            plan: {
                _id: brandsPlan.currentPlan._id,
                code: brandsPlan.currentPlan.code,
                icon: brandsPlan.currentPlan.icon,
                name: brandsPlan.currentPlan.name,
                monthlyPrice: brandsPlan.currentPlan.monthlyPrice,
                yearlyPrice: brandsPlan.currentPlan.yearlyPrice,
                translation: brandsPlan.currentPlan.translation,
            },
            branchLimit: branchLimit,
            staffLimit: staffLimit,
            daysRemaining: daysRemaining,
            secondsPassed: secondsPassed / 1000,
            price: brandsPlan.period === "monthly" ? brandsPlan.currentPlan.monthlyPrice : brandsPlan.currentPlan.yearlyPrice,
            period: brandsPlan.period,
            branchCount,
            staffCount,
        };
    }

    async getLastBill(brandID: string): Promise<any> {
        const query = async (filter: {}) => {
            return await this.BillModel.findOne(filter).sort({ _id: "descending" }).populate<{ plan: Plan }>("plan", "_id icon name translation").exec();
        };

        let bill = await query({ brand: brandID, type: "renewal", status: { $in: ["notPaid", "pendingPayment"] } });
        if (!bill) bill = await query({ brand: brandID });
        if (!bill) return {};

        return {
            _id: bill._id,
            billNumber: bill.billNumber,
            type: bill.type,
            description: bill.description,
            forHowLong: bill.secondsAddedToInvoice ? humanizeDuration(bill.secondsAddedToInvoice * 1000, { language: I18nContext.current().lang, largest: 1 }) : "",
            planPeriod: bill.planPeriod,
            payablePrice: bill.payablePrice,
            status: bill.status,
            dueDate: bill.dueDate,
            createdAt: bill.createdAt,
            translation: bill.translation,
            plan: bill.plan,
        };
    }

    getGateway(method: string): GatewayInterface | null {
        let gateway = null;
        switch (method) {
            case "zarinpal":
                gateway = new ZarinpalGateway(process.env.ZARINPAL_KEY);
                break;
            case "wallet":
                gateway = new WalletGateway();
                break;
        }
        return gateway;
    }

    async generateBillNumber(): Promise<number> {
        let billNumberExists: boolean = true;
        let billNumber: number = 0;

        while (billNumberExists) {
            billNumber = Math.floor(100000000 + Math.random() * 900000000);
            billNumberExists = (await this.BillModel.exists({ billNumber: billNumber }).exec()) ? true : false;
        }

        return billNumber;
    }

    async updateBillTransactionRecord(
        billID: Types.ObjectId | string,
        transactionID: Types.ObjectId | string,
        status: "pending" | "ok" | "canceled" | "error",
        ip?: string,
        error?: string,
        code?: string,
        paidPrice?: number,
    ): Promise<void> {
        const set = { status: status };

        if (ip) set["ip"] = ip;
        if (error) set["error"] = error;
        if (code) set["code"] = code;
        if (paidPrice) set["paidPrice"] = paidPrice;

        await this.TransactionModel.updateOne({ _id: transactionID }, { ...set }).exec();
    }

    async proccessTransactionForPlanChange(bill: Bill, nextInvoiceInSeconds: number, userID: string, brandCurrentPlan: BrandsPlan) {
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
            user: userID,
            previusPlan: brandCurrentPlan.currentPlan,
            newPlan: bill.plan,
            previusPeriod: brandCurrentPlan.period,
            newPeriod: bill.planPeriod,
            createdAt: new Date(Date.now()),
        });

        // after successful payable downgrade/upgrade (that extends the invoice time) any renewal bill will be canceled
        if (bill.secondsAddedToInvoice > 0)
            await this.BillModel.updateOne({ brand: bill.brand, type: "renewal", status: { $in: ["notPaid", "pendingPayment"] } }, { status: "canceled" }).exec();
    }

    async proccessTransactionForPlanRenewal(bill: Bill, nextInvoiceInSeconds: number) {
        // update brand plan nextInvoice
        await this.BrandsPlanModel.updateOne(
            { brand: bill.brand },
            { currentPlan: bill.plan, nextInvoice: new Date((nextInvoiceInSeconds + bill.secondsAddedToInvoice) * 1000) },
        ).exec();
    }
}

interface CurrentPlan {
    plan: {
        _id: string | Types.ObjectId;
        icon: string;
        code: number;
        name: string;
        monthlyPrice: number;
        yearlyPrice: number;
        translation: any;
    };
    branchLimit: string;
    staffLimit: string;
    daysRemaining: string | null;
    secondsPassed: number;
    price: number;
    period: "monthly" | "yearly";
    branchCount: number;
    staffCount: number;
}
