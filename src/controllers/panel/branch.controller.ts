import { Body, Param, Query, Controller, Delete, Get, InternalServerErrorException, Post, Put, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { FileService } from "src/services/file.service";
import { unlink } from "fs/promises";
import { FileInterceptor } from "@nestjs/platform-express";
import { IDBranchDto, IDBrandDto } from "src/dto/panel/branch.dto";
import { I18nContext } from "nestjs-i18n";
import { BranchDocument } from "src/models/Branches.schema";

@Controller("panel/branches")
export class BranchController {
    constructor(
        // ...
        private readonly fileService: FileService,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
    ) {}

    // TODO : set permission check on every method - we can try custom decorators for this

    @Get("/:brandID")
    async getList(@Param() params: IDBrandDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const branches = await this.BranchModel.find({ brand: params.brandID }).select("name address telephoneNumbers postalCode gallery translation").exec();

        // TODO : check if plans branch limit is passed or not
        const canCreateNewBranch = true;

        return res.json({ records: branches, canCreateNewBranch });
    }

    @Get("/:id")
    async getSingleRecord(@Req() req: Request, @Res() res: Response): Promise<void | Response> {}

    @Post("/")
    @UseInterceptors(FileInterceptor("logo"))
    async addRecord(@UploadedFile() logo: Express.Multer.File, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        // check if user already has a brand then dont allow new brand creation
    }

    @Put("/:id")
    @UseInterceptors(FileInterceptor("logo"))
    async editRecord(@UploadedFile() logo: Express.Multer.File, @Req() req: Request, @Res() res: Response): Promise<void | Response> {}

    @Delete("/:branchID")
    async deleteSingleRecord(@Param() params: IDBranchDto, @Query() query: IDBrandDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const branch = await this.BranchModel.findOne({ _id: params.branchID, brand: query.brandID }).select("logo name slogan").exec();

        console.log({ branch });
        return res.end();

        // check if user authorize to delete this record - user must be owner of brand
        if (!branch) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        // delete branch
        await this.BranchModel.deleteOne({ _id: params.branchID, brand: query.brandID }).exec();

        // TODO : delete branch staff
        // TODO : delete branch custom menu

        return res.end();
    }
}
