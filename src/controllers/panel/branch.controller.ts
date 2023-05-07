import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
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
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUser } from "src/guards/authorizeUser.guard";

@Controller("panel/branches")
export class BranchController {
    constructor(
        // ...
        private readonly fileService: FileService,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
    ) {}

    // TODO : set permission check on every method - we can try custom decorators for this

    @Get("/")
    @SetPermissions("main-panel.branches.view")
    @UseGuards(AuthorizeUser)
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];
        const branches = await this.BranchModel.find({ brand: brandID }).select("name address telephoneNumbers postalCode gallery translation").exec();

        // TODO : check if plans branch limit is passed or not
        const canCreateNewBranch = true;

        return res.json({ records: branches, canCreateNewBranch });
    }

    @Get("/:id")
    @SetPermissions("main-panel.branches.view")
    @UseGuards(AuthorizeUser)
    async getSingleRecord(@Param() params: IDBranchDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const branch = await this.BranchModel.findOne({ _id: params.id }).exec();
        if (!branch) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        const name = { default: branch.name };
        const address = { default: branch.address };
        for (const lang in languages) {
            if (branch.translation && branch.translation[lang]) {
                name[lang] = branch.translation[lang].name;
                address[lang] = branch.translation[lang].address;
            }
        }

        return res.json({ gallery: branch.gallery, name, address, telephoneNumbers: branch.telephoneNumbers, postalCode: branch.postalCode });
    }

    @Post("/")
    @SetPermissions("main-panel.branches.add")
    @UseGuards(AuthorizeUser)
    @UseInterceptors(FilesInterceptor("gallery"))
    async addRecord(
        @UploadedFiles() gallery: Express.Multer.File[],
        @Body() body: CreateNewBranchDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        // TODO : check brand limit for creating branches

        // limit user to upload at max 5 images
        if (gallery.length > 5) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("file.max file count is n", { args: { count: 5 } })] }]);
        }

        const brandID = req.headers["brand"];
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
            brand: brandID,
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
    @SetPermissions("main-panel.branches.edit")
    @UseGuards(AuthorizeUser)
    @UseInterceptors(FilesInterceptor("gallery"))
    async editRecord(
        @UploadedFiles() gallery: Express.Multer.File[],
        @Param() params: IDBranchDto,
        @Body() body: EditBranchDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        const branch = await this.BranchModel.findOne({ _id: params.id }).exec();
        if (!branch) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        let branchGallery = branch.gallery;
        const newGalleryList = body.galleryList;
        for (let i = 0; i < branchGallery.length; i++) {
            if (newGalleryList.includes(branchGallery[i])) continue;
            await unlink(branchGallery[i].replace("/file/", "storage/public/")).catch((e) => {});
            branchGallery[i] = null;
        }
        branchGallery = branchGallery.filter((image) => image !== null);

        // limit user to upload at max 5 images
        if (branchGallery.length + gallery.length > 5) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("file.max file count is n", { args: { count: 5 } })] }]);
        }

        // upload new images
        const galleryLinks = await this.fileService.saveUploadedImages(gallery, "gallery", 2 * 1_048_576, ["png", "jpeg", "jpg", "webp"], 768, "public", "/gallery");
        branchGallery = [...branchGallery, ...galleryLinks];

        const translation = {};
        for (const lang in languages) {
            if (body[`name.${lang}`] || body[`address.${lang}`]) {
                translation[lang] = {
                    name: body[`name.${lang}`],
                    address: body[`address.${lang}`],
                };
            }
        }

        await this.BranchModel.updateOne(
            { _id: params.id },
            {
                name: body["name.default"],
                address: body["address.default"],
                telephoneNumbers: body.telephoneNumbers,
                postalCode: body.postalCode,
                gallery: branchGallery,
                translation: translation,
            },
        );

        return res.json({ gallery: branchGallery });
    }

    @Delete("/:id")
    @SetPermissions("main-panel.branches.delete")
    @UseGuards(AuthorizeUser)
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
        // TODO : delete branch images
        // TODO : delete branch staff
        // TODO : delete branch custom menu

        return res.end();
    }
}
