import { Body, Param, Controller, Delete, Get, InternalServerErrorException, Post, Put, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { BrandDocument } from "src/models/Brands.schema";
import { StaffDocument } from "src/models/Staff.schema";
import { FileService } from "src/services/file.service";
import { unlink } from "fs/promises";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateNewBrandDto, DeleteBrandDto, EditBrandDto } from "src/dto/userPanel/brand.dto";
import { I18nContext } from "nestjs-i18n";

@Controller("brand-panel/brands")
export class BrandController {
    constructor(
        // ...
        private readonly fileService: FileService,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
    ) {}

    @Get("/")
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const userBrands = {};

        // get brands that user owns
        const brands = await this.BrandModel.find({ creator: req.session.userID, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
            .select("logo name slogan")
            .exec();
        for (let i = 0; i < brands.length; i++) {
            const brand = brands[i];
            userBrands[brand.id] = { _id: brand.id, logo: brand.logo, name: brand.name, slogan: brand.slogan, roles: ["owner"] };
        }

        // from staff document get brands that user is part of
        const staff = await this.StaffModel.find({ user: req.session.userID })
            .select("brand")
            .populate("brand", "_id logo name slogan")
            .populate("branches.role", "name")
            .exec();
        for (let i = 0; i < staff.length; i++) {
            const member = staff[i];
            // TODO : after we did branches api we need to get thi roles list
            // const roles = member.branches.map((branch) => branch.role.name);
            // userBrands[member.brand._id.toString()] = { logo: member.brand.logo, name: member.brand.name, roles };

            userBrands[member.brand._id.toString()] = { _id: member.brand._id.toString(), logo: member.brand.logo, name: member.brand.name, roles: [] };
        }

        // TODO : get the branch count for each brands

        const canCreateNewBrand = brands.length > 0 ? false : true;

        return res.json({ records: Object.values(userBrands), canCreateNewBrand });
    }

    @Get("/:id")
    async getSingleRecord(@Req() req: Request, @Res() res: Response): Promise<void | Response> {}

    @Post("/")
    @UseInterceptors(FileInterceptor("logo"))
    async addRecord(
        @UploadedFile() logo: Express.Multer.File,
        @Body() input: CreateNewBrandDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        // check if user already has a brand then dont allow new brand creation
    }

    @Put("/:id")
    @UseInterceptors(FileInterceptor("logo"))
    async editRecord(@UploadedFile() logo: Express.Multer.File, @Body() input: EditBrandDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {}

    @Delete("/:id")
    async deleteSingleRecord(@Param() input: DeleteBrandDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brand = await this.BrandModel.findOne({ creator: req.session.userID, _id: input.id }).select("logo name slogan").exec();

        // check if user authorize to delete this record - user must be owner of brand
        if (!brand) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("userPanel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        // mark the record as deleted
        await this.BrandModel.updateOne({ creator: req.session.userID, _id: input.id }, { deletedAt: new Date(Date.now()) }).exec();

        // TODO : cancel that brand's subscription

        return res.end();
    }
}
