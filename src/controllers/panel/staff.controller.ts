import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { FileService } from "src/services/file.service";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { IdDto, SendInviteDTO } from "src/dto/panel/staff.dto";
import { languages } from "src/interfaces/Translation.interface";
import { I18nContext } from "nestjs-i18n";
import { BranchDocument } from "src/models/Branches.schema";
import { StaffDocument } from "src/models/Staff.schema";
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
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];
        // TODO : aggrigate this query and add pp and search filter
        const staff = await this.StaffModel.find({ brand: brandID }).select("user role").populate("user", "avatar name family email mobile").exec();

        // TODO : check if plans staff limit is passed or not this is per branch
        const canInviteNewMembers = true;

        return res.json({ records: staff, total: staff.length, canInviteNewMembers });
    }

    @Post("/invite")
    @SetPermissions("main-panel.staff.invite")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async send(@Body() body: SendInviteDTO, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
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
