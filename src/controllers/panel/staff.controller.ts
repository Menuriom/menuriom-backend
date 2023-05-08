import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { FileService } from "src/services/file.service";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { CreateNewBranchDto, EditBranchDto, IDBranchDto, IDBrandDto } from "src/dto/panel/branch.dto";
import { languages } from "src/interfaces/Translation.interface";
import { I18nContext } from "nestjs-i18n";
import { BranchDocument } from "src/models/Branches.schema";
import { StaffDocument } from "src/models/Staff.schema";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUser } from "src/guards/authorizeUser.guard";

@Controller("panel/staff")
export class StaffController {
    constructor(
        // ...
        private readonly fileService: FileService,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
    ) {}

    @Get("/")
    @SetPermissions("main-panel.staff.view")
    @UseGuards(AuthorizeUser)
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];
        // TODO : aggrigate this query and add pp and search filter
        const staff = await this.StaffModel.find({ brand: brandID }).select("user role").populate("user", "avatar name family email mobile").exec();

        // TODO : check if plans staff limit is passed or not this is per branch
        const canInviteNewMembers = true;

        return res.json({ records: staff, total: staff.length, canInviteNewMembers });
    }

    @Delete("/:id")
    @SetPermissions("main-panel.staff.delete")
    @UseGuards(AuthorizeUser)
    async deleteSingleRecord(@Param() params: IDBranchDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        return res.end();
    }
}
