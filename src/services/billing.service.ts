import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { StaffDocument } from "src/models/Staff.schema";
import { BranchDocument } from "src/models/Branches.schema";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { Plan, PlanDocument } from "src/models/Plans.schema";
import * as humanizeDuration from "humanize-duration";
import { I18nContext } from "nestjs-i18n";
import { GatewayInterface } from "src/interfaces/Gateway";
import { ZarinpalGateway } from "src/paymentGateways/zarinpal.payment";
import { WalletGateway } from "src/paymentGateways/wallet.payment";

@Injectable()
export class BillingService {
    constructor(
        // ...
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Plan") private readonly PlanModel: Model<PlanDocument>,
    ) {}

    async calculatePrice(currentPlan: CurrentPlan, selectedPlan: Plan, selectedPaymentPeriod: "monthly" | "yearly"): Promise<number> {
        let calculatedPrice: number = 0;
        const devider = selectedPaymentPeriod === "monthly" ? 30 : 365;
        const remainingDays = currentPlan.secondsPassed ? Math.floor(Number(currentPlan.secondsPassed) / (3600 * 24)) : Infinity;

        const purchasablePlans = this.PlanModel.find().select("_id icon name desc limitations listings monthlyPrice yearlyPrice translation").exec();

        if (currentPlan.plan.name === purchasablePlans[0].name) {
            calculatedPrice = selectedPlan[`${selectedPaymentPeriod}Price`];
        }

        if (currentPlan.plan.name === purchasablePlans[1].name) {
            if (remainingDays <= 5) {
                calculatedPrice = selectedPlan[`${selectedPaymentPeriod}Price`];
            } else {
                if (selectedPlan.name === purchasablePlans[2].name) {
                    const diff = purchasablePlans[2][`${selectedPaymentPeriod}Price`] - purchasablePlans[1][`${selectedPaymentPeriod}Price`];
                    calculatedPrice = Math.floor((diff * remainingDays) / devider);
                }
            }
        }

        if (currentPlan.plan.name === purchasablePlans[2].name && remainingDays <= 5) {
            calculatedPrice = selectedPlan[`${selectedPaymentPeriod}Price`];
        }

        return calculatedPrice;
    }

    async getBrandsCurrentPlan(brandID: string): Promise<CurrentPlan> {
        const brandsPlan = await this.BrandsPlanModel.findOne({ brand: brandID })
            .populate<{ currentPlan: Plan }>("currentPlan", "_id icon name limitations monthlyPrice yearlyPrice translation")
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
        if (brandsPlan.nextInvoice && brandsPlan.invoiceStartAt) {
            // secondsPassed = brandsPlan.nextInvoice.getTime() - brandsPlan.invoiceStartAt.getTime();
            secondsPassed = brandsPlan.nextInvoice.getTime() - Date.now();
            daysRemaining = humanizeDuration(secondsPassed, { language: I18nContext.current().lang, largest: 1 });
        }

        return {
            plan: {
                _id: brandsPlan.currentPlan._id,
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
        // TODO
        return 2;
    }
}

interface CurrentPlan {
    plan: {
        _id: string | Types.ObjectId;
        icon: string;
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
