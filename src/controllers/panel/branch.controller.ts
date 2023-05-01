import { Body, Param, Query, Controller, Delete, Get, InternalServerErrorException, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { FileService } from "src/services/file.service";
import { unlink } from "fs/promises";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { CreateNewBranchDto, EditBranchDto, IDBranchDto, IDBrandDto } from "src/dto/panel/branch.dto";
import { languages } from "src/interfaces/Translation.interface";
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

    @Post("/:brandID")
    @UseInterceptors(FilesInterceptor("gallery"))
    async addRecord(
        @UploadedFiles() gallery: Express.Multer.File[],
        @Param() params: IDBrandDto,
        @Body() body: CreateNewBranchDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        // TODO : check if user has access to this brand and has permission to create branches
        // TODO : check branch limit

        const galleryLinks = await this.fileService.saveUploadedImages(gallery, "gallery", 2 * 1_048_576, ["png", "jpeg", "jpg", "webp"], 768, "public", "/gallery");

        const translation = {};
        for (const lang in languages) {
            if (body[`name.${lang}`] || body[`address.${lang}`]) {
                translation[lang] = {
                    name: body[`name.${lang}`],
                    address: body[`address.${lang}`],
                };
            }
        }

        await this.BranchModel.create({
            brand: params.brandID,
            name: body["name.default"],
            address: body["address.default"],
            telephoneNumbers: body.telephoneNumbers,
            postalCode: body.postalCode,
            gallery: galleryLinks,
            createdAt: new Date(Date.now()),
            translation: translation,
        });

        return res.end();
    }

    @Put("/:id")
    @UseInterceptors(FilesInterceptor("gallery"))
    async editRecord(
        @UploadedFiles() logo: Express.Multer.File[],
        @Body() body: EditBranchDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        // ...
    }

    @Delete("/:id")
    async deleteSingleRecord(@Param() params: IDBranchDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const branch = await this.BranchModel.findOne({ _id: params.id }).select("logo name slogan").exec();

        if (!branch) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        // TODO : get the branch
        // check if =? does user has access to brand and can user delete branches in this brand

        // delete branch
        await this.BranchModel.deleteOne({ _id: params.id }).exec();
        // TODO : delete branch staff
        // TODO : delete branch custom menu

        return res.end();
    }
}
