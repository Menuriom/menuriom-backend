import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, ForbiddenException, InternalServerErrorException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { FileService } from "src/services/file.service";
import { I18nContext } from "nestjs-i18n";
import { BranchDocument } from "src/models/Branches.schema";
import { StaffDocument } from "src/models/Staff.schema";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { StaffRoleDocument } from "src/models/StaffRoles.schema";
import { StaffPermissionDocument } from "src/models/StaffPermissions.schema";
import { NewRoleDto } from "src/dto/panel/staffRole.dto";
import { IdDto } from "src/dto/general.dto";

@Controller("panel/staff-roles")
export class StaffRolesController {
    constructor(
        // ...
        private readonly fileService: FileService,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
        @InjectModel("StaffRole") private readonly StaffRoleModel: Model<StaffRoleDocument>,
        @InjectModel("StaffPermission") private readonly StaffPermissionModel: Model<StaffPermissionDocument>,
    ) {}

    @Get("/permissions-list")
    @SetPermissions("main-panel.staff.roles")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getPermissionList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const permissions = await this.StaffPermissionModel.find().select("_id label desc groupLabel group translation").exec();
        const groupedPermissions = [];
        let currentGroup = "";
        let list = [];
        for (let i = 0; i < permissions.length; i++) {
            if (currentGroup !== permissions[i].group) {
                if (list.length > 0) groupedPermissions.push(list);
                currentGroup = permissions[i].group;
                list = [];
            }
            list.push({ ...permissions[i].toObject() });
        }
        groupedPermissions.push(list);

        return res.json({ permissions: groupedPermissions });
    }

    // =======================================================================

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
                    { $match: { $expr: { $eq: ["$role", "$$staffRoleId"] } } },
                    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
                    { $limit: 5 },
                ],
                as: "staff",
            });
        }
        data.project({ _id: 1, name: 1, permissions: 1, "staff.user.avatar": 1, "staff.user.name": 1, "staff.user.family": 1 });

        // executing query and getting the results
        let error;
        const exec: any[] = await data.exec().catch((e) => (error = e));
        if (error) throw new InternalServerErrorException();
        const results = exec.map((record) => {
            return {
                _id: record._id,
                name: record.name,
                permissions: record.permissions[0],
                staff: record.staff.map((x) => ({ avatar: x.user[0].avatar, name: x.user[0].name, family: x.user[0].family })),
            };
        });

        const canCreateNewRoles = results.length >= 15 ? false : true;

        return res.json({ records: results, canCreateNewRoles });
    }

    @Get("/:id")
    @SetPermissions("main-panel.staff.roles")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        const role = await this.StaffRoleModel.findOne({ _id: params.id, brand: brandID }).exec();
        if (!role) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        return res.json({ permissions: role.permissions, name: role.name });
    }

    @Post("/")
    @SetPermissions("main-panel.staff.roles")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async addRecord(@Body() body: NewRoleDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        // check brand limit for creating roles
        const roleCount = await this.StaffRoleModel.countDocuments({ brand: brandID }).exec();
        if (roleCount >= 15) {
            throw new ForbiddenException([
                { property: "", errors: [I18nContext.current().t("panel.staff.You have reached your max role limit! try to delete your unused roles")] },
            ]);
        }

        // check if all permissions are valid
        const permissionList = await this.StaffPermissionModel.find({ _id: { $in: body.permissions } })
            .select("_id")
            .exec();
        if (permissionList.length !== body.permissions.length) throw new ForbiddenException();

        await this.StaffRoleModel.create({
            name: body.roleName,
            permissions: body.permissions,
            brand: brandID,
            createdAt: new Date(Date.now()),
        });

        return res.end();
    }

    @Put("/:id")
    @SetPermissions("main-panel.staff.roles")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async editRecord(@Param() params: IdDto, @Body() body: NewRoleDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        // check if all permissions are valid
        const permissionList = await this.StaffPermissionModel.find({ _id: { $in: body.permissions } })
            .select("_id")
            .exec();
        if (permissionList.length !== body.permissions.length) throw new ForbiddenException();

        await this.StaffRoleModel.updateOne({ _id: params.id, brand: brandID }, { name: body.roleName, permissions: body.permissions }).exec();

        return res.end();
    }

    @Delete("/:id")
    @SetPermissions("main-panel.staff.roles")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async deleteSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        const staffRole = await this.StaffRoleModel.findOne({ _id: params.id, brand: brandID }).exec();
        if (!staffRole) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        const roleInUse = await this.StaffModel.exists({ role: params.id, brand: brandID }).exec();
        if (roleInUse) {
            throw new UnprocessableEntityException([
                {
                    property: "",
                    errors: [
                        I18nContext.current().t("panel.staff.This role is in use! unassigned it from all staff members that are using this role then try again"),
                    ],
                },
            ]);
        }

        await this.StaffRoleModel.deleteOne({ _id: params.id, brand: brandID }).exec();

        return res.end();
    }
}
