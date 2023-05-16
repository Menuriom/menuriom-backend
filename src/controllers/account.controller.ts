import { Body, Controller, Delete, ForbiddenException, Get, Post, Req, Res, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { NotFoundException, InternalServerErrorException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { UserDocument } from "src/models/Users.schema";
import { BrandDocument } from "src/models/Brands.schema";
import { BranchDocument } from "src/models/Branches.schema";
import { FileService } from "src/services/file.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { SetupBrandDto, acceptInvitesDto, invitationListDto } from "src/dto/panel/account.dto";
import { I18nContext } from "nestjs-i18n";
import { StaffRoleDefaultDocument } from "src/models/StaffRoleDefaults.schema";
import { StaffRoleDocument } from "src/models/StaffRoles.schema";
import { Invite, InviteDocument } from "src/models/Invites.schema";
import { StaffDocument } from "src/models/Staff.schema";

@Controller("account")
export class AccountController {
    constructor(
        // ...
        private readonly fileService: FileService,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("Invite") private readonly InviteModel: Model<InviteDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
        @InjectModel("StaffRoleDefault") private readonly StaffRoleDefaultModel: Model<StaffRoleDefaultDocument>,
        @InjectModel("StaffRole") private readonly StaffRoleModel: Model<StaffRoleDocument>,
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

    @Post("/invites")
    async acceptInvites(@Body() body: acceptInvitesDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).select("_id email").exec();
        if (!user) throw new ForbiddenException();

        const invites = await this.InviteModel.find({ _id: { $in: body.invites }, email: user.email, status: "sent" })
            .populate("brand", "_id logo name")
            .populate("role", "name permissions")
            .limit(3)
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

        return res.json({ brands });
    }

    @Post("/setup-brand")
    @UseInterceptors(FileInterceptor("logo"))
    async setupBrand(@UploadedFile() logo: Express.Multer.File, @Body() input: SetupBrandDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        // check if user already has a brand then dont allow new brand creation
        const userBrand = await this.BrandModel.exists({ creator: req.session.userID, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }).exec();
        if (userBrand) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.brand.You can only create 1 brand!")] }]);
        }

        if (!logo) {
            throw new UnprocessableEntityException([{ property: "logo", errors: [I18nContext.current().t("panel.brand.Please select your brand logo")] }]);
        }
        const logoLink = await this.fileService.saveUploadedImages([logo], "logo", 1_048_576, ["png", "jpeg", "jpg", "webp"], 256, "public", "/logos");

        // creating user's first brand
        const newBrand = await this.BrandModel.create({
            logo: logoLink[0],
            name: input.name,
            slogan: input.slogan,
            branchSize: input.branchSize,
            creator: req.session.userID,
            createdAt: new Date(Date.now()),
        });

        // creating user's first branch
        await this.BranchModel.create({
            brand: newBrand.id,
            name: I18nContext.current().t("panel.brand.Main Branch"),
            address: input.address,
            telephoneNumbers: input.tel,
            createdAt: new Date(Date.now()),
        });

        // adding default roles to brand staff roles
        const defaultRoles = await this.StaffRoleDefaultModel.find().exec();
        const roles = defaultRoles.map((role) => {
            return { brand: newBrand.id, name: role.name, permissions: role.permissions, translation: role.translation };
        });
        await this.StaffRoleModel.insertMany(roles);

        return res.json({
            newId: newBrand.id,
            brand: { [newBrand.id]: { logo: newBrand.logo, name: newBrand.name, role: "owner", permissions: [] } },
        });
    }
}
