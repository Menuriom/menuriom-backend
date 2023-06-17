import { Injectable } from "@nestjs/common";
import { PlanLimitation } from "src/models/PlansLimitations.schema";

@Injectable()
export class PlanService {
    constructor() {}

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
}
