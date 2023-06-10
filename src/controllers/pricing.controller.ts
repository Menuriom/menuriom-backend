import * as fs from "fs/promises";
import { Body, Controller, Get, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PlanDocument } from "src/models/Plans.schema";

@Controller("pricing")
export class PricingController {
    constructor(
        // ...
        @InjectModel("Plan") private readonly PlanModel: Model<PlanDocument>,
    ) {}

    @Get("/purchasable-plans")
    async getPurchasablePlans(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const plans = await this.PlanModel.find().select("_id icon name desc limitations listings monthlyPrice yearlyPrice translation").exec();

        return res.json({ plans });
    }
}
