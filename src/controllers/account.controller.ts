import { Body, Controller, Delete, ForbiddenException, Get, Post, Req, Res, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { NotFoundException, InternalServerErrorException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { UserDocument } from "src/models/Users.schema";
import { Brand, BrandDocument } from "src/models/Brands.schema";
import { BranchDocument } from "src/models/Branches.schema";
import { FileService } from "src/services/file.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { SetupBrandDto, acceptInvitesDto, invitationListDto } from "src/dto/panel/account.dto";
import { I18nContext } from "nestjs-i18n";
import { StaffRoleDefaultDocument } from "src/models/StaffRoleDefaults.schema";
import { StaffRole, StaffRoleDocument } from "src/models/StaffRoles.schema";
import { Invite, InviteDocument } from "src/models/Invites.schema";
import { StaffDocument } from "src/models/Staff.schema";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { Plan, PlanDocument } from "src/models/Plans.schema";
import { TransactionDocument } from "src/models/Transactions.schema";
import { ListingDto } from "src/dto/panel/billing.dto";
import { SessionDocument } from "src/models/Sessions.schema";
import * as UAParser from "ua-parser-js";
import * as humanizeDuration from "humanize-duration";
import { AccountService } from "src/services/account.service";

@Controller("account")
export class AccountController {
    constructor(
        // ...
        private readonly fileService: FileService,
        private readonly AccountService: AccountService,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("Session") private readonly SessionModel: Model<SessionDocument>,
        @InjectModel("Invite") private readonly InviteModel: Model<InviteDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("Plan") private readonly PlanModel: Model<PlanDocument>,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
        @InjectModel("StaffRoleDefault") private readonly StaffRoleDefaultModel: Model<StaffRoleDefaultDocument>,
        @InjectModel("StaffRole") private readonly StaffRoleModel: Model<StaffRoleDocument>,
        @InjectModel("Transaction") private readonly TransactionModel: Model<TransactionDocument>,
    ) {}

    @Get("/invitation-list")
    async invitationList(@Query() query: invitationListDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).select("_id email").exec();
        if (!user) throw new ForbiddenException();

        // sort
        let sort: any = { _id: -1 };

        // the base query object
        let matchQuery: FilterQuery<any> = { email: user.email, status: "sent" };
        if (query.lastRecordID) matchQuery = { _id: { $lt: new Types.ObjectId(query.lastRecordID) }, ...matchQuery };

        // making the model with query
        let data = this.InviteModel.aggregate();
        data.sort(sort);
        data.match(matchQuery);
        data.limit(Number(query.pp));
        data.lookup({ from: "brands", localField: "brand", foreignField: "_id", as: "brand" });
        data.lookup({ from: "staffroles", localField: "role", foreignField: "_id", as: "role" });
        data.lookup({ from: "branches", localField: "branches", foreignField: "_id", as: "branches" });
        data.project({ _id: 1, createdAt: 1, "brand.logo": 1, "brand.name": 1, "role.name": 1, "branches.name": 1 });

        // executing query and getting the results
        let error;
        const exec: any[] = await data.exec().catch((e) => (error = e));
        if (error) throw new InternalServerErrorException();
        const invites: Invite[] = exec.map<Invite>((record): Invite => {
            return { _id: record._id, brand: record.brand[0], role: record.role[0], branches: record.branches, createdAt: record.createdAt };
        });

        const totalBrands = await this.StaffModel.countDocuments({ user: req.session.userID }).exec();

        return res.json({ invites, totalBrands });
    }

    @Post("/accept-invites")
    async acceptInvites(@Body() body: acceptInvitesDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).select("_id email").exec();
        if (!user) throw new ForbiddenException();

        // checking how many brands this user is staff of
        const staffLimit: number = await this.StaffModel.countDocuments({ user: new Types.ObjectId(req.session.userID) }).exec();
        if (staffLimit >= 3) {
            throw new ForbiddenException([{ property: "", errors: [I18nContext.current().t("panel.brand.You can join three brands at a max!")] }]);
        }

        const invites = await this.InviteModel.find({ _id: { $in: body.invites }, email: user.email, status: "sent" })
            .populate<{ brand: Brand }>("brand", "_id logo name")
            .populate<{ role: StaffRole }>("role", "name permissions")
            .limit(3 - staffLimit)
            .exec();

        // put user in brands staff list
        const brands = {};
        const staffInsert = [];
        for (let i = 0; i < invites.length; i++) {
            const invite = invites[i];
            brands[invite.brand._id.toString()] = { logo: invite.brand.logo, name: invite.brand.name, role: invite.role.name, permissions: invite.role.permissions };
            staffInsert.push({ user: user._id, brand: invite.brand, role: invite.role, branches: invite.branches });
        }
        await this.StaffModel.insertMany(staffInsert);

        // change status of invites
        const inviteValidIds = invites.map((invite) => invite._id);
        await this.InviteModel.updateMany({ _id: { $in: inviteValidIds } }, { status: "accepted" }).exec();

        // add brand limitations
        const brandsPlans = await this.BrandsPlanModel.find({ brand: { $in: Object.keys(brands) } })
            .select("_id brand")
            .populate<{ currentPlan: Plan }>("currentPlan", "_id limitations")
            .exec();
        brandsPlans.forEach((brandsPlan) => (brands[brandsPlan.brand.toString()]["limitations"] = brandsPlan.currentPlan.limitations));

        return res.json({ brands });
    }

    @Post("/reject-invites")
    async rejectInvites(@Body() body: acceptInvitesDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).select("_id email").exec();
        if (!user) throw new ForbiddenException();

        // change status of invites
        await this.InviteModel.updateMany({ _id: { $in: body.invites }, email: user.email, status: "sent" }, { status: "rejected" }).exec();

        return res.end();
    }

    @Post("/setup-brand")
    @UseInterceptors(FileInterceptor("logo"))
    async setupBrand(@UploadedFile() logo: Express.Multer.File, @Body() input: SetupBrandDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const userBrand = await this.BrandModel.exists({ creator: req.session.userID, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }).exec();
        if (userBrand) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.brand.You can only create 1 brand!")] }]);
        }

        const isUsernameTaken = await this.BrandModel.exists({ username: input.username }).exec();
        if (isUsernameTaken) {
            throw new UnprocessableEntityException([{ property: "username", errors: [I18nContext.current().t("panel.brand.this username is already taken")] }]);
        }

        if (!logo) {
            throw new UnprocessableEntityException([{ property: "logo", errors: [I18nContext.current().t("panel.brand.Please select your brand logo")] }]);
        }
        const logoLink = await this.fileService.saveUploadedImages([logo], "logo", 1_048_576, ["png", "jpeg", "jpg", "webp"], 256, "public", "/logos");

        const newBrand = await this.BrandModel.create({
            logo: logoLink[0],
            username: input.username,
            name: input.name,
            slogan: input.slogan,
            branchSize: input.branchSize,
            creator: req.session.userID,
            languages: ["en", "fa"],
            createdAt: new Date(Date.now()),
        });

        const firstFreePlan = await this.PlanModel.findOne({ monthlyPrice: 0, halfYearPrice: 0, yearlyPrice: 0 }).select("_id limitations").exec();
        await this.BrandsPlanModel.create({
            brand: newBrand.id,
            currentPlan: firstFreePlan._id,
            period: "monthly",
            startTime: new Date(Date.now()),
            createdAt: new Date(Date.now()),
        });

        await this.BranchModel.create({
            brand: newBrand.id,
            name: I18nContext.current().t("panel.brand.Main Branch"),
            address: input.address,
            telephoneNumbers: input.tel,
            createdAt: new Date(Date.now()),
        });

        await this.AccountService.setupBaseMenuStyle(newBrand.id);

        await this.AccountService.setupBaseWorkingHours(newBrand.id);

        // adding default roles to brand staff roles
        const defaultRoles = await this.StaffRoleDefaultModel.find().exec();
        const roles = defaultRoles.map((role) => {
            return { brand: newBrand.id, name: role.name, permissions: role.permissions, translation: role.translation };
        });
        await this.StaffRoleModel.insertMany(roles);

        return res.json({
            newId: newBrand.id,
            brand: { [newBrand.id]: { logo: newBrand.logo, name: newBrand.name, role: "owner", permissions: [], limitations: firstFreePlan.limitations } },
        });
    }

    @Get("/user-transactions")
    async getUserTransactionList(@Query() query: ListingDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        // sort
        let sort: any = { _id: -1 };

        // the base query object
        let matchQuery: FilterQuery<any> = { user: new Types.ObjectId(req.session.userID) };
        if (query.lastRecordID) matchQuery = { _id: { $lt: new Types.ObjectId(query.lastRecordID) }, ...matchQuery };
        if (req.query.billID) matchQuery["bill"] = new Types.ObjectId(req.query.billID.toString());

        // making the model with query
        let data = this.TransactionModel.aggregate();
        data.sort(sort);
        data.match(matchQuery);
        data.lookup({ from: "bills", localField: "bill", foreignField: "_id", as: "bill" });
        data.lookup({ from: "brands", localField: "brand", foreignField: "_id", as: "brand" });
        data.project({
            _id: 1,
            code: 1,
            method: 1,
            paidPrice: 1,
            status: 1,
            createdAt: 1,
            "bill.billNumber": 1,
            "bill.description": 1,
            "bill.translation": 1,
            "brand.logo": 1,
            "brand.name": 1,
            "brand.translation": 1,
        });
        data.limit(Number(query.pp));

        // executing query and getting the results
        let error;
        const exec: any[] = await data.exec().catch((e) => (error = e));
        if (error) throw new InternalServerErrorException();
        const transactions: any[] = exec.map((record) => {
            return {
                _id: record._id,
                code: record.code,
                method: record.method,
                paidPrice: record.paidPrice,
                status: record.status,
                createdAt: record.createdAt,
                bill: record.bill[0],
                brand: record.brand[0],
            };
        });

        return res.json({ transactions });
    }

    @Get("/active-sessions")
    async getActiveSessions(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const currentSession = await this.SessionModel.findOne({ _id: req.session.sessionID }).select("userAgent ip status expireAt updatedAt").lean();
        const otherActiveSessions = await this.SessionModel.find({ _id: { $ne: req.session.sessionID }, user: req.session.userID, status: "active" })
            .select("userAgent ip status expireAt updatedAt")
            .limit(8)
            .lean();

        currentSession.userAgent = new UAParser(currentSession.userAgent).getResult();

        const now = Date.now();

        for (const otherActiveSession of otherActiveSessions) {
            otherActiveSession.userAgent = new UAParser(otherActiveSession.userAgent).getResult();

            const timePassedFromLastUpdate = (now - otherActiveSession.updatedAt.getTime()) / 1000;
            if (timePassedFromLastUpdate > 900) {
                otherActiveSession["lastOnline"] = humanizeDuration(timePassedFromLastUpdate * 1000, { language: I18nContext.current().lang, largest: 1 });
            } else {
                otherActiveSession["lastOnline"] = "online";
            }
        }

        return res.json({ currentSession, otherActiveSessions });
    }

    @Post("/terminate-session")
    async terminateSession(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const doesSessionExists = await this.SessionModel.exists({ _id: req.body.session, user: req.session.userID, status: "active" }).exec();
        if (!doesSessionExists) throw new NotFoundException();

        await this.SessionModel.updateOne({ _id: req.body.session, user: req.session.userID, status: "active" }, { status: "revoked" }).exec();

        return res.end();
    }
}
