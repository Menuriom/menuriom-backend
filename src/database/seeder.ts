import { Controller, Get, InternalServerErrorException, Req, Res } from "@nestjs/common";
import { Request } from "src/interfaces/Request.interface";
import { Response } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserDocument } from "src/models/users.schema";
import { StaffPermissionDocument } from "src/models/StaffPermissions.schema";
import { records as staffPermissionRecords } from "src/database/seeds/staffPermissions.seed";

@Controller("seeder")
export class Seeder {
    constructor(
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("StaffPermission") private readonly StaffPermissionModel: Model<StaffPermissionDocument>,
    ) {}

    @Get("/seed/all")
    async seedAll(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        // add any other seeds here in order
        // ->

        await this.seedPermissions(req, res, false);
        // await this.seedPermissionGroups(req, res, false);
        // await this.seedDefaultSuperAdmin(req, res, false);

        return res.json({ seedAll: 1 });
    }

    @Get("/seed/permissions")
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

    // @Get("/seed/permission-groups")
    // async seedPermissionGroups(@Req() req: Request, @Res() res: Response, end = true): Promise<void | Response> {}

    // @Get("/seed/super-admin")
    // async seedDefaultSuperAdmin(@Req() req: Request, @Res() res: Response, end = true): Promise<void | Response> {}
}
