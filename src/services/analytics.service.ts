import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "src/interfaces/Request.interface";
import { Model } from "mongoose";
import { UserDocument } from "src/models/Users.schema";
import { AnalyticDocument } from "src/models/Analytics.schema";
import { BrandDocument } from "src/models/Brands.schema";
import { BranchDocument } from "src/models/Branches.schema";

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Analytic") private readonly AnalyticModel: Model<AnalyticDocument>,
    ) {}

    async analyticCountUp(
        marketer = null,
        teacher = null,
        incrementBy: number,
        infoName: "income" | "new-users" | "sells" | "link-clicked",
        forGroup: "total" | "marketer" | "teacher",
        type: "both" | "daily" | "monthly" = "both",
    ): Promise<void> {
        // const today = moment().add(1, "day").format("YYYY-MM-DDT00:00:00");
        // const thisMonth = moment().add(1, "day").format("YYYY-MM-01T00:00:00");
        // if (type == "both") {
        //     await this.update(marketer, teacher, incrementBy, infoName, forGroup, "daily", today);
        //     await this.update(marketer, teacher, incrementBy, infoName, forGroup, "monthly", thisMonth);
        // } else {
        //     const date = type == "daily" ? today : thisMonth;
        //     await this.update(marketer, teacher, incrementBy, infoName, forGroup, type, date);
        // }
    }

    // ========================================

    private async update(marketer, teacher, incrementBy, infoName, forGroup, type, date) {
        await this.AnalyticModel.updateOne(
            {
                marketer: marketer,
                teacher: teacher,
                infoName: infoName,
                forGroup: forGroup,
                type: type,
                date: date,
            },
            { $inc: { count: incrementBy } },
            { upsert: true },
        ).exec();
    }
}
