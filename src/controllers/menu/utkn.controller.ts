import { Body, Controller, Delete, ForbiddenException, Get, Post, Put, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { sign, verify } from "jsonwebtoken";
import { UtknDocument } from "src/models/Utkns.schema";
import { AnalyticsService } from "src/services/analytics.service";
import { BrandDocument } from "src/models/Brands.schema";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { Plan } from "src/models/Plans.schema";

@Controller("utkn")
export class UtknController {
    constructor(
        // ...
        private readonly analyticService: AnalyticsService,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("Utkn") private readonly UtknModel: Model<UtknDocument>,
    ) {}

    @Post("/")
    async verifyAndSaveToken(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const ip = req.headers.ipaddr?.toString() || req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || null;
        const userAgent = req.headers["user-agent"];

        let utkn = req.body.utkn || req.cookies["utkn"] || "";
        let scn_d = req.cookies["scn_d"] || "";
        let scn_m = req.cookies["scn_m"] || "";
        let brandUsername = req.body.brand || "";

        utkn = await this.handleUtkn(utkn, ip, userAgent);

        ({ scn_d, scn_m } = await this.handleScans(brandUsername, scn_d, scn_m));

        return res.json({ token: utkn || "", scn_d, scn_m });
    }

    // ======================================================================

    private async generateAndSaveToken(ip: string | null, userAgent: string) {
        const payload = { ip: ip, userAgent: userAgent, iat: Date.now() };
        const token = sign(payload, process.env.JWT_SECRET, { algorithm: "HS512", expiresIn: 2_592_000 });

        await this.UtknModel.create({
            ip,
            userAgent,
            token,
            status: "active",
            expireAt: new Date(Date.now() + 2_592_000 * 1000),
            createdAt: new Date(Date.now()),
        });

        return token;
    }

    private async handleUtkn(utkn: string, ip: string | null, userAgent: string): Promise<string> {
        if (!utkn) {
            const token = await this.generateAndSaveToken(ip, userAgent);
            return token;
        }

        let payload: any = {};
        try {
            payload = verify(utkn, process.env.JWT_SECRET, { ignoreExpiration: false });
        } catch (err) {
            console.log({ utkn });
        }

        if (typeof payload["ip"] === "undefined" || typeof payload["userAgent"] === "undefined") {
            const token = await this.generateAndSaveToken(ip, userAgent);
            return token;
        }

        // TODO
        // update the token if more than a day passed from its creation
    }

    private async handleScans(brandUsername: string, scn_d: any, scn_m: any): Promise<{ scn_d: string; scn_m: string }> {
        const brand = await this.BrandModel.findOne({ username: brandUsername }).exec();
        if (!brand) return { scn_d, scn_m };

        const brandPlan = await this.BrandsPlanModel.findOne({ brand: brand._id }).populate<{ currentPlan: Plan }>("currentPlan", "_id name").exec();

        if (brandPlan.currentPlan.name !== "پلن پایه") {
            // means this scan is unique for this day
            if (!scn_d) {
                scn_d = "1";
                await this.analyticService.analyticCountUp(brand._id, null, "qrScans", "daily", 1, 1);
            } else await this.analyticService.analyticCountUp(brand._id, null, "qrScans", "daily", 1, 0);
        }

        // means this scan is unique for this month
        if (!scn_m) {
            scn_m = "1";
            await this.analyticService.analyticCountUp(brand._id, null, "qrScans", "monthly", 1, 1);
        } else await this.analyticService.analyticCountUp(brand._id, null, "qrScans", "monthly", 1, 0);

        return { scn_d, scn_m };
    }
}
