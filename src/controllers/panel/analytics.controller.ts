import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { FileService } from "src/services/file.service";
import { unlink } from "fs/promises";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { CreateNewBranchDto, EditBranchDto, IDBrandDto } from "src/dto/panel/branch.dto";
import { languages } from "src/interfaces/Translation.interface";
import { I18nContext } from "nestjs-i18n";
import { BranchDocument } from "src/models/Branches.schema";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { IdDto } from "src/dto/general.dto";
import { CheckUnpaidInvoiceInSelectedBrand } from "src/guards/billExpiration.guard";

@Controller("panel/analytics")
export class AnalyticsController {
    constructor(
        // ...
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
    ) {}

    // TODO : order
    // save the income and order count daily and monthly

    // TODO : registers
    // save user registers monthly for standard and above

    // TODO : counters
    // save likes and views monthly for every brand

    // TODO : dont store data more than 2 years old

    // TODO : show each section to use base on their access

    @Get("/")
    @SetPermissions("main-panel.branches.view")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];
        const branches = await this.BranchModel.find({ brand: brandID }).select("name address telephoneNumbers postalCode gallery translation").exec();

        // TODO : check if plans branch limit is passed or not
        const canCreateNewBranch = true;

        const date = new Intl.DateTimeFormat("en-UK").format(Date.now());
        const dateDigest = date.split("/");

        console.log({
            date: date,
            today: `${dateDigest[2]}-${dateDigest[1]}-${dateDigest[0]}`,
            thisMonth: `${dateDigest[2]}-${dateDigest[1]}-00`,
            // G2J: new Intl.DateTimeFormat("fa", { calendar: "persian", numberingSystem: "latn" }).format(date),
            // J2G: jalaali.toGregorian(1402, 10, 10),
        });

        return res.json({ records: branches, canCreateNewBranch });
    }
}
