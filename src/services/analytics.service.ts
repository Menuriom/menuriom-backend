import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Analytic, AnalyticDocument } from "src/models/Analytics.schema";

type BaseUpdate = { brand: string; branch?: string; name: Analytic["name"]; type: Analytic["type"]; date: string };

interface UpdateCount extends BaseUpdate {
    incrementCountBy?: number;
}
interface UpdateUniqueCount extends BaseUpdate {
    incrementUniqueCountBy?: number;
}
interface UpdateIncome extends BaseUpdate {
    incrementIncomeBy?: number;
}

@Injectable()
export class AnalyticsService {
    constructor(
        // ...
        @InjectModel("Analytic") private readonly AnalyticModel: Model<AnalyticDocument>,
    ) {}

    J2G(date: string) {
        const [year, month, day] = date.split("-").map(Number);

        const persianDateObj = new Date();
        persianDateObj.setFullYear(year + 621);
        persianDateObj.setMonth(month - 1 + 2);
        persianDateObj.setDate(day + 20.5);

        return new Intl.DateTimeFormat("en-UK", { year: "numeric", month: "2-digit", day: "2-digit" }).format(persianDateObj);
    }

    async analyticCountUp(
        brand: string,
        branch: string | null,
        name: Analytic["name"],
        type: "daily" | "monthly" | "both" = "both",
        incrementCountBy: number | null,
        incrementUniqueCountBy?: number | null,
        incrementIncomeBy?: number | null,
    ): Promise<void> {
        const date = new Intl.DateTimeFormat("en-UK").format(Date.now());
        const dateDigest = date.split("/");

        const today = `${dateDigest[2]}-${dateDigest[1]}-${dateDigest[0]}T12:00:00Z`;
        const thisMonth = `${dateDigest[2]}-${dateDigest[1]}-01T12:00:00Z`;

        if (type == "both") {
            await Promise.allSettled([
                this.update({ brand, branch, name, incrementCountBy, incrementUniqueCountBy, incrementIncomeBy, type: "daily", date: today }),
                this.update({ brand, branch, name, incrementCountBy, incrementUniqueCountBy, incrementIncomeBy, type: "monthly", date: thisMonth }),
            ]);
        } else {
            const date = type == "daily" ? today : thisMonth;
            await this.update({ brand, branch, name, incrementCountBy, incrementUniqueCountBy, incrementIncomeBy, type, date: date });
        }
    }

    // ========================================

    private async update({
        brand,
        branch,
        name,
        type,
        incrementCountBy,
        incrementUniqueCountBy,
        incrementIncomeBy,
        date,
    }: UpdateCount & UpdateUniqueCount & UpdateIncome) {
        const inc = {};
        if (incrementCountBy) inc["count"] = incrementCountBy;
        if (incrementUniqueCountBy) inc["uniqueCount"] = incrementUniqueCountBy;
        if (incrementIncomeBy) inc["income"] = incrementIncomeBy;

        await this.AnalyticModel.updateOne(
            { brand, branch, name, type, date },
            { $inc: inc, $setOnInsert: { createdAt: new Date(Date.now()) } },
            { upsert: true },
        ).exec();
    }
}
