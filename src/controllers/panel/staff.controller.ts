import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { FileService } from "src/services/file.service";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { EditStaffAccessDto, ListingDto, SendInviteDto } from "src/dto/panel/staff.dto";
import { languages } from "src/interfaces/Translation.interface";
import { I18nContext } from "nestjs-i18n";
import { Branch, BranchDocument } from "src/models/Branches.schema";
import { Staff, StaffDocument } from "src/models/Staff.schema";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { Invite, InviteDocument } from "src/models/Invites.schema";
import { StaffRole, StaffRoleDocument } from "src/models/StaffRoles.schema";
import { User, UserDocument } from "src/models/Users.schema";
import { IdDto } from "src/dto/general.dto";
import { CheckUnpaidInvoiceInSelectedBrand } from "src/guards/billExpiration.guard";
import { PlanService } from "src/services/plan.service";
import { NotifsService } from "src/services/notifs.service";
import { BrandDocument } from "src/models/Brands.schema";

@Controller("panel/staff")
export class StaffController {
    constructor(
        // ...
        private readonly fileService: FileService,
        private readonly planService: PlanService,
        private readonly notifsService: NotifsService,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
        @InjectModel("StaffRole") private readonly StaffRoleModel: Model<StaffRoleDocument>,
        @InjectModel("Invite") private readonly InviteModel: Model<InviteDocument>,
    ) {}

    @Get("/sent-invites")
    @SetPermissions("main-panel.staff.invite")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getSentInvites(@Query() query: ListingDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        // sort
        let sort: any = { _id: -1 };

        // the base query object
        let matchQuery: FilterQuery<any> = { brand: new Types.ObjectId(brandID), status: { $in: ["sent", "rejected"] } };
        if (query.lastRecordID) matchQuery = { _id: { $lt: new Types.ObjectId(query.lastRecordID) }, ...matchQuery };

        // making the model with query
        let data = this.InviteModel.aggregate();
        data.sort(sort);
        data.match(matchQuery);
        data.limit(Number(query.pp));
        data.lookup({ from: "staffroles", localField: "role", foreignField: "_id", as: "role" });
        data.project({ _id: 1, email: 1, status: 1, createdAt: 1, "role.name": 1 });

        // executing query and getting the results
        let error;
        const exec: any[] = await data.exec().catch((e) => (error = e));
        if (error) throw new InternalServerErrorException();
        const invites: Invite[] = exec.map<Invite>((record): Invite => {
            return { _id: record._id, email: record.email, status: record.status, createdAt: record.createdAt, role: record.role[0], branches: null, brand: null };
        });

        return res.json({ records: invites });
    }

    // ===============================================

    @Get("/")
    @SetPermissions("main-panel.staff.view")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getStaffList(@Query() query: ListingDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        // sort
        let sort: any = { _id: -1 };

        // the base query object
        let matchQuery: FilterQuery<any> = { brand: new Types.ObjectId(brandID) };
        if (query.lastRecordID) matchQuery = { _id: { $lt: new Types.ObjectId(query.lastRecordID) }, ...matchQuery };

        // making the model with query
        let data = this.StaffModel.aggregate();
        data.sort(sort);
        data.match(matchQuery);
        data.lookup({ from: "users", localField: "user", foreignField: "_id", as: "user" });
        data.lookup({ from: "staffroles", localField: "role", foreignField: "_id", as: "role" });
        data.lookup({ from: "branches", localField: "branches", foreignField: "_id", as: "branches" });
        data.project({
            _id: 1,
            createdAt: 1,
            fullname: { $concat: [{ $arrayElemAt: ["$user.name", 0] }, " ", { $arrayElemAt: ["$user.family", 0] }] },
            "user.avatar": 1,
            "user.name": 1,
            "user.family": 1,
            "user.email": 1,
            "user.mobile": 1,
            "role._id": 1,
            "role.name": 1,
            "branches._id": 1,
            "branches.name": 1,
        });
        if (query.searchQuery) {
            data.match({
                $or: [
                    { fullname: { $regex: new RegExp(`.*${query.searchQuery}.*`, "i") } },
                    { "user.email": { $regex: new RegExp(`.*${query.searchQuery}.*`, "i") } },
                    { "user.mobile": { $regex: new RegExp(`.*${query.searchQuery}.*`, "i") } },
                    { "role.name": { $regex: new RegExp(`.*${query.searchQuery}.*`, "i") } },
                    { "branches.name": { $regex: new RegExp(`.*${query.searchQuery}.*`, "i") } },
                ],
            });
        }
        data.limit(Number(query.pp));

        // executing query and getting the results
        let error;
        const exec: any[] = await data.exec().catch((e) => (error = e));
        if (error) throw new InternalServerErrorException();
        const staff: Staff[] = exec.map<Staff>((record): Staff => {
            return { _id: record._id, branches: record.branches, createdAt: record.createdAt, user: record.user[0], role: record.role[0], brand: null };
        });

        const total = await this.StaffModel.countDocuments({ brand: brandID }).exec();

        const staffLimit = await this.planService.checkLimitCounts<number>(brandID, "staff-limit-count");
        const canInviteNewMembers = total < staffLimit;

        return res.json({ records: staff, total: total, canInviteNewMembers });
    }

    @Post("/invite")
    @SetPermissions("main-panel.staff.invite")
    @UseGuards(AuthorizeUserInSelectedBrand, CheckUnpaidInvoiceInSelectedBrand)
    async sendAnInvite(@Body() body: SendInviteDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        // check if the user is already in brand or not
        const user = await this.UserModel.findOne({ email: body.email }).exec();
        if (user) {
            const alreadyIsStaff = await this.StaffModel.exists({ user: user._id, brand: brandID }).exec();
            if (alreadyIsStaff) {
                throw new ForbiddenException([{ property: "", errors: [I18nContext.current().t("panel.staff.This user is already on your staff team")] }]);
            }
        }

        // check if the role belong to the brand
        const isRoleBlongToBrand = await this.StaffRoleModel.exists({ _id: body.selectedRole, brand: brandID }).exec();
        if (!isRoleBlongToBrand) {
            throw new ForbiddenException([
                { property: "", errors: [I18nContext.current().t("panel.staff.The role you've chosen is not in your brand's role list")] },
            ]);
        }

        // check if the selectedBranches belongs to the brand
        const branchesList = await this.BranchModel.find({ _id: { $in: body.selectedBranches }, brand: brandID })
            .select("_id")
            .exec();
        if (branchesList.length !== body.selectedBranches.length) {
            throw new ForbiddenException([
                { property: "", errors: [I18nContext.current().t("panel.staff.Some of the branches you choose are not from your brand")] },
            ]);
        }

        const staffLimit = await this.planService.checkLimitCounts<number>(brandID, "staff-limit-count");
        const staffCount = await this.StaffModel.countDocuments({ brand: brandID }).exec();
        const inviteCount = await this.InviteModel.countDocuments({ brand: brandID, status: "sent" }).exec();
        if (staffCount + inviteCount >= staffLimit) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.brand.You have reached your staff limit")] }]);
        }

        await this.InviteModel.updateOne(
            { email: body.email, brand: brandID },
            { role: body.selectedRole, branches: body.selectedBranches, status: "sent", createdAt: new Date(Date.now()) },
            { upsert: true },
        ).exec();

        const brand = await this.BrandModel.findOne({ _id: brandID }).exec();
        if (user) await this.notifsService.notif({ user: user._id, type: "new-invite", data: { brandName: brand.name }, sendAsEmail: true, showInSys: false });

        return res.json({ userExists: !!user });
    }

    @Put("/:id")
    @SetPermissions("main-panel.staff.alter")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async editStaffMemberAccess(@Param() params: IdDto, @Body() body: EditStaffAccessDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];
        const staff = await this.StaffModel.findOne({ _id: params.id, brand: brandID }).exec();
        if (!staff) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        // check if the role belong to the brand
        const isRoleBlongToBrand = await this.StaffRoleModel.exists({ _id: body.selectedRole, brand: brandID }).exec();
        if (!isRoleBlongToBrand) {
            throw new ForbiddenException([
                { property: "", errors: [I18nContext.current().t("panel.staff.The role you've chosen is not in your brand's role list")] },
            ]);
        }

        // check if the selectedBranches belongs to the brand
        const branchesList = await this.BranchModel.find({ _id: { $in: body.selectedBranches }, brand: brandID })
            .select("_id")
            .exec();
        if (branchesList.length !== body.selectedBranches.length) {
            throw new ForbiddenException([
                { property: "", errors: [I18nContext.current().t("panel.staff.Some of the branches you choose are not from your brand")] },
            ]);
        }

        await this.StaffModel.updateOne({ _id: params.id, brand: brandID }, { role: body.selectedRole, branches: body.selectedBranches }).exec();
        const updatedStaff = await this.StaffModel.findOne({ _id: params.id, brand: brandID })
            .populate("user", "avatar name family email mobile")
            .populate("branches", "_id name")
            .populate("role", "_id name")
            .exec();

        return res.json({ updatedRecord: updatedStaff });
    }

    @Delete("/:id")
    @SetPermissions("main-panel.staff.delete")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async deleteSingleStaff(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();
        const staff = await this.StaffModel.findOne({ _id: params.id, brand: brandID }).exec();
        if (!staff) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }
        await this.StaffModel.deleteOne({ _id: params.id, brand: brandID }).exec();

        const staffCount = await this.StaffModel.countDocuments({ brand: brandID }).exec();
        const staffLimit = await this.planService.checkLimitCounts<number>(brandID, "staff-limit-count");

        return res.json({ canInviteNewMembers: staffCount < staffLimit });
    }

    @Delete("/invite/:id")
    @SetPermissions("main-panel.staff.invite")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async deleteSingleInvites(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];
        const invite = await this.InviteModel.findOne({ _id: params.id, brand: brandID }).exec();
        if (!invite) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }
        await this.InviteModel.deleteOne({ _id: params.id, brand: brandID }).exec();
        return res.end();
    }
}
