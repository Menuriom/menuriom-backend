import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Analytic, AnalyticDocument } from "src/models/Analytics.schema";

type BaseUpdate = {
    brand: string;
    branch?: string;
    menuItem?: string;
    name: Analytic["name"];
    type: Analytic["type"] | "both";
    date?: string;
};

interface UpdateCount extends BaseUpdate {
    incrementCountBy: number;
    incrementUniqueCountBy?: number;
    incrementIncomeBy?: number;
}
interface UpdateUniqueCount extends BaseUpdate {
    incrementCountBy?: number;
    incrementUniqueCountBy: number;
    incrementIncomeBy?: number;
}
interface UpdateIncome extends BaseUpdate {
    incrementCountBy?: number;
    incrementUniqueCountBy?: number;
    incrementIncomeBy: number;
}

@Injectable()
export class AnalyticsService {
    constructor(
        // ...
        @InjectModel("Analytic") private readonly AnalyticModel: Model<AnalyticDocument>,
    ) {}

    private J2G(jy: number, jm: number, jd: number) {
        jy += 1595;
        let days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
        let gy = 400 * Math.floor(days / 146097);
        days %= 146097;
        if (days > 36524) {
            gy += 100 * Math.floor(--days / 36524);
            days %= 36524;
            if (days >= 365) days++;
        }
        gy += 4 * Math.floor(days / 1461);
        days %= 1461;
        if (days > 365) {
            gy += Math.floor((days - 1) / 365);
            days = (days - 1) % 365;
        }
        let gd = days + 1;
        let sal_a = [0, 31, (gy % 4 == 0 && gy % 100 != 0) || gy % 400 == 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let gm = 0;
        for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
        return `${gy}-${gm}-${gd}`;
    }

    async analyticCountUp(
        // brand: string,
        // branch: string | null,
        // menuItem: string | null,
        // name: Analytic["name"],
        // type: "daily" | "monthly" | "both" = "both",
        // incrementCountBy: number | null,
        // incrementUniqueCountBy?: number | null,
        // incrementIncomeBy?: number | null,
        { brand, branch, menuItem, name, type, incrementCountBy, incrementUniqueCountBy, incrementIncomeBy }: UpdateCount | UpdateUniqueCount | UpdateIncome,
    ): Promise<void> {
        const date = new Intl.DateTimeFormat("en-UK").format(Date.now());
        const dateDigest = date.split("/");

        const today = `${dateDigest[2]}-${dateDigest[1]}-${dateDigest[0]}T12:00:00Z`;
        const thisMonth = `${dateDigest[2]}-${dateDigest[1]}-01T12:00:00Z`;

        if (type == "both") {
            await Promise.allSettled([
                this.update({ brand, branch, menuItem, name, incrementCountBy, incrementUniqueCountBy, incrementIncomeBy, type: "daily", date: today }),
                this.update({ brand, branch, menuItem, name, incrementCountBy, incrementUniqueCountBy, incrementIncomeBy, type: "monthly", date: thisMonth }),
            ]);
        } else {
            const date = type == "daily" ? today : thisMonth;
            await this.update({ brand, branch, menuItem, name, incrementCountBy, incrementUniqueCountBy, incrementIncomeBy, type, date: date });
        }
    }

    // ========================================

    private async update({
        brand,
        branch,
        menuItem,
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
            { brand, branch, menuItem, name, type, date },
            { $inc: inc, $setOnInsert: { createdAt: new Date(Date.now()) } },
            { upsert: true },
        ).exec();
    }
}
