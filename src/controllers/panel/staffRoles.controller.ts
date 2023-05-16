import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, ForbiddenException, InternalServerErrorException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { FileService } from "src/services/file.service";
import { CreateNewBranchDto, EditBranchDto, IDBranchDto, IDBrandDto } from "src/dto/panel/branch.dto";
import { languages } from "src/interfaces/Translation.interface";
import { I18nContext } from "nestjs-i18n";
import { BranchDocument } from "src/models/Branches.schema";
import { StaffDocument } from "src/models/Staff.schema";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { StaffRoleDefault } from "src/models/StaffRoleDefaults.schema";
import { StaffRole } from "src/models/StaffRoles.schema";

@Controller("panel/staff-roles")
export class StaffRolesController {
    constructor(
        // ...
        private readonly fileService: FileService,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
        @InjectModel("StaffRole") private readonly StaffRoleModel: Model<StaffRoleDefault>,
    ) {}

    @Get("/")
    @SetPermissions("main-panel.staff.roles", "main-panel.staff.invite", "main-panel.staff.alter")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID: string = req.headers["brand"].toString();

        let forListing = false; // for listing roles in forms
        if (req.query.fields && req.query.fields === "name") forListing = true;

        // the base query object
        let query = { brand: new Types.ObjectId(brandID) };

        // sort
        let sort: any = { _id: -1 };

        let data = this.StaffRoleModel.aggregate();
        data.match(query);
        data.sort(sort);
        if (!forListing) {
            data.lookup({
                from: "staffs",
                let: { staffRoleId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$user", "$$staffRoleId"] } } },
                    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
                    // { $limit: 5 },
                ],
                as: "staff",
            });
        }
        data.project({ _id: 1, name: 1, permissions: 1, "staff.user.avatar": 1, "staff.user.name": 1, "staff.user.family": 1 });

        // executing query and getting the results
        let error;
        const exec: any = await data.exec().catch((e) => (error = e));
        if (error) throw new InternalServerErrorException();
        const results: StaffRole[] = exec;

        const canCreateNewRoles = results.length >= 15 ? false : true;

        return res.json({ records: results, canCreateNewRoles });
    }

    @Delete("/:id")
    @SetPermissions("main-panel.staff.roles")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async deleteSingleRecord(@Param() params: IDBranchDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        return res.end();
    }
}
