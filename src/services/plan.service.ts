import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { Plan } from "src/models/Plans.schema";
import { PlanLimitation } from "src/models/PlansLimitations.schema";

@Injectable()
export class PlanService {
    constructor(
        // ...
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
    ) {}

    checkLimitations(LimitationsToCheck = [], limitations: { limit: PlanLimitation | string; value: any }[], style = "OR"): boolean {
        const Limitations = {};
        limitations.forEach((limitation) => (Limitations[limitation.limit.toString()] = limitation.value));

        if (style == "AND") {
            for (let i = 0; i < LimitationsToCheck.length; i++) {
                if (Limitations[LimitationsToCheck[i][0]] !== LimitationsToCheck[i][1]) return false;
            }
            return true;
        } else {
            for (let i = 0; i < LimitationsToCheck.length; i++) {
                if (Limitations[LimitationsToCheck[i][0]] === LimitationsToCheck[i][1]) return true;
            }
            return false;
        }
    }

    async checkLimitCounts<T>(brandID: string, limitName: string): Promise<T> {
        const brandsPlan = await this.BrandsPlanModel.findOne({ brand: brandID })
            .populate<{ currentPlan: Plan }>("currentPlan", "_id code limitations translation")
            .exec();

        let limit: any;
        let branchLimit: number;
        brandsPlan.currentPlan.limitations.forEach((item) => {
            if (item.limit == "branch-limit-count") branchLimit = Number(item.value);
            if (item.limit == limitName) {
                limit = item.valueType == "Number" ? Number(item.value) : Boolean(item.value);
            }
        });
        if (limitName == "staff-limit-count") limit = limit * branchLimit;

        return limit;
    }
}
