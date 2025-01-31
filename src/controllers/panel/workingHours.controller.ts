import { Body, Param, Controller, UseGuards, Delete, Get, Post, Put, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Brand, BrandDocument } from "src/models/Brands.schema";
import { StaffDocument } from "src/models/Staff.schema";
import { FileService } from "src/services/file.service";
import { I18nContext } from "nestjs-i18n";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { IdDto } from "src/dto/general.dto";
import { WorkingHoursDto } from "src/dto/panel/workingHours.dto";
import { WorkingHourDocument } from "src/models/WorkingHours.schema";
import { PlanService } from "src/services/plan.service";

@Controller("panel/working-hours")
export class WorkingHoursController {
    constructor(
        // ...
        private readonly planService: PlanService,
        @InjectModel("WorkingHour") private readonly WorkingHourModel: Model<WorkingHourDocument>,
    ) {}

    @Get("/")
    @SetPermissions("main-panel.branches.edit")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getWorkingHours(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const workingHours = await this.WorkingHourModel.findOne({ brand: brandID }).select("workingHours").exec();
        if (!workingHours) {
            return res.end();
        }

        return res.json({ workingHours: workingHours.workingHours });
    }

    @Post("/")
    @SetPermissions("main-panel.branches.edit")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async saveWorkingHours(@Body() body: WorkingHoursDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        const canHaveWorkingHours = await this.planService.checkLimitCounts<boolean>(brandID, "restaurant-detailed-info");
        if (!canHaveWorkingHours) return res.end();

        await this.WorkingHourModel.updateOne({ brand: brandID }, { workingHours: body.workingHours, createdAt: new Date(Date.now()) }, { upsert: true });
        return res.end();
    }
}
