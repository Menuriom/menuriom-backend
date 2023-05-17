import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { FileService } from "src/services/file.service";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { IdDto, ListingDto, SendInviteDto } from "src/dto/panel/staff.dto";
import { languages } from "src/interfaces/Translation.interface";
import { I18nContext } from "nestjs-i18n";
import { BranchDocument } from "src/models/Branches.schema";
import { Staff, StaffDocument } from "src/models/Staff.schema";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { InviteDocument } from "src/models/Invites.schema";
import { StaffRoleDocument } from "src/models/StaffRoles.schema";
import { UserDocument } from "src/models/Users.schema";

@Controller("panel/staff")
export class StaffController {
    constructor(
        // ...
        private readonly fileService: FileService,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
        @InjectModel("StaffRole") private readonly StaffRoleModel: Model<StaffRoleDocument>,
        @InjectModel("Invite") private readonly InviteModel: Model<InviteDocument>,
    ) {}

    @Get("/")
    @SetPermissions("main-panel.staff.view")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getList(@Query() query: ListingDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        // sort
        let sort: any = { _id: -1 };

        // the base query object
        let matchQuery: FilterQuery<any> = {};
        if (query.lastRecordID) matchQuery = { _id: { $lt: new Types.ObjectId(query.lastRecordID) }, ...matchQuery };

        // making the model with query
        let data = this.StaffModel.aggregate();
        data.sort(sort);
        data.match(matchQuery);
        data.limit(Number(query.pp));
        data.lookup({ from: "users", localField: "user", foreignField: "_id", as: "user" });
        data.lookup({ from: "staffroles", localField: "role", foreignField: "_id", as: "role" });
        data.project({ _id: 1, "user.avatar": 1, "user.name": 1, "user.family": 1, "user.email": 1, "user.mobile": 1, "role.name": 1 });

        // executing query and getting the results
        let error;
        const exec: any[] = await data.exec().catch((e) => (error = e));
        if (error) throw new InternalServerErrorException();
        const staff = exec.map((record) => {
            return { _id: record._id, user: record.user[0], role: record.role[0] };
        });

        const total = await this.StaffModel.countDocuments().exec();

        // TODO : check if plans staff limit is passed or not this is per branch
        const canInviteNewMembers = true;

        return res.json({ records: staff, total: total, canInviteNewMembers });
    }

    @Post("/invite")
    @SetPermissions("main-panel.staff.invite")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async send(@Body() body: SendInviteDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        // check if the user is already in brand or not
        const user = await this.UserModel.findOne({ email: body.email }).exec();
        if (user) {
            const alreadyIsStaff = await this.StaffModel.exists({ user: user, brand: brandID }).exec();
            if (alreadyIsStaff) {
                throw new ForbiddenException({ property: "", errors: [I18nContext.current().t("panel.staff.This user is already on your staff team")] });
            }
        }

        // check if the role belong to the brand
        const isRoleBlongToBrand = await this.StaffRoleModel.exists({ _id: body.selectedRole, brand: brandID }).exec();
        if (!isRoleBlongToBrand) {
            throw new ForbiddenException({ property: "", errors: [I18nContext.current().t("panel.staff.The role you've chosen is not in your brand's role list")] });
        }

        // check if the selectedBranches belongs to the brand
        const branchesList = await this.BranchModel.find({ _id: { $in: body.selectedBranches }, brand: brandID })
            .select("_id")
            .exec();
        if (branchesList.length !== body.selectedBranches.length) {
            throw new ForbiddenException({ property: "", errors: [I18nContext.current().t("panel.staff.Some of the branches you choose are not from your brand")] });
        }

        // TODO : foreach branch that is selected : check if plans staff limit is passed or not
        // if the limit is passed then return to user with the list of filled branches
        const canInviteNewMembers = true || false;

        await this.InviteModel.updateOne(
            { email: body.email, brand: brandID },
            { role: body.selectedRole, branches: body.selectedBranches, status: "sent", createdAt: new Date(Date.now()) },
            { upsert: true },
        ).exec();

        return res.json({ userExists: !!user });
    }

    @Delete("/:id")
    @SetPermissions("main-panel.staff.delete")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async deleteSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        return res.end();
    }
}
