import { Controller, Get, InternalServerErrorException, Req, Res } from "@nestjs/common";
import { Request } from "src/interfaces/Request.interface";
import { Response } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserDocument } from "src/models/Users.schema";
import { StaffPermissionDocument } from "src/models/StaffPermissions.schema";
import { StaffRoleDefaultDocument } from "src/models/StaffRoleDefaults.schema";
import { PlanDocument } from "src/models/Plans.schema";
import { PlanLimitationDocument } from "src/models/PlansLimitations.schema";
import { records as staffPermissionRecords } from "src/database/seeds/staffPermissions.seed";
import { records as staffDefaultRoles } from "src/database/seeds/staffDefaultRoles.seed";
import { records as plans } from "src/database/seeds/plans.seed";
import { records as plansLimitations } from "src/database/seeds/plansLimitations.seed";

@Controller("seeder")
export class Seeder {
    constructor(
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("StaffPermission") private readonly StaffPermissionModel: Model<StaffPermissionDocument>,
        @InjectModel("StaffRoleDefault") private readonly StaffRoleDefaultModel: Model<StaffRoleDefaultDocument>,
        @InjectModel("Plan") private readonly PlanModel: Model<PlanDocument>,
        @InjectModel("PlanLimitation") private readonly PlanLimitationModel: Model<PlanLimitationDocument>,
    ) {}

    @Get("/seed/all")
    async seedAll(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        // add any other seeds here in order
        // ->

        await this.seedPermissions(req, res, false);
        await this.seedStaffDefaultRoles(req, res, false);
        await this.seedPlans(req, res, false);
        await this.seedPlansLimitations(req, res, false);
        // await this.seedDefaultSuperAdmin(req, res, false);

        return res.json({ seedAll: 1 });
    }

    @Get("/seed/staff-permissions")
    async seedPermissions(@Req() req: Request, @Res() res: Response, end = true): Promise<void | Response> {
        this.StaffPermissionModel.collection.drop().catch((e) => {
            throw new InternalServerErrorException(e);
        });

        const records = staffPermissionRecords.map((permission) => {
            return { ...permission.record, translation: permission.translation };
        });

        await this.StaffPermissionModel.insertMany(records).catch((e) => {
            throw new InternalServerErrorException(e);
        });

        if (end) return res.json({ seedPermissions: 1 });
    }

    @Get("/seed/staff-default-roles")
    async seedStaffDefaultRoles(@Req() req: Request, @Res() res: Response, end = true): Promise<void | Response> {
        this.StaffRoleDefaultModel.collection.drop().catch((e) => {
            throw new InternalServerErrorException(e);
        });

        const records = staffDefaultRoles.map((role) => {
            return { ...role.record, translation: role.translation };
        });

        await this.StaffRoleDefaultModel.insertMany(records).catch((e) => {
            throw new InternalServerErrorException(e);
        });

        if (end) return res.json({ seedStaffDefaultRoles: 1 });
    }

    @Get("/seed/plans")
    async seedPlans(@Req() req: Request, @Res() res: Response, end = true): Promise<void | Response> {
        this.PlanModel.collection.drop().catch((e) => {
            throw new InternalServerErrorException(e);
        });

        const records = plans.map((plan) => {
            return { ...plan.record, translation: plan.translation };
        });

        await this.PlanModel.insertMany(records).catch((e) => {
            throw new InternalServerErrorException(e);
        });

        if (end) return res.json({ seedPlans: 1 });
    }

    @Get("/seed/plans-limitations")
    async seedPlansLimitations(@Req() req: Request, @Res() res: Response, end = true): Promise<void | Response> {
        this.PlanLimitationModel.collection.drop().catch((e) => {
            throw new InternalServerErrorException(e);
        });

        const records = plansLimitations.map((plansLimitation) => {
            return { ...plansLimitation.record, translation: plansLimitation.translation };
        });

        await this.PlanLimitationModel.insertMany(records).catch((e) => {
            throw new InternalServerErrorException(e);
        });

        if (end) return res.json({ seedPlansLimitations: 1 });
    }

    // @Get("/seed/super-admin")
    // async seedDefaultSuperAdmin(@Req() req: Request, @Res() res: Response, end = true): Promise<void | Response> {}
}
