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
import { AuthService } from "src/services/auth.service";
import { unlink } from "fs/promises";
import { FileInterceptor } from "@nestjs/platform-express";
import { EditBrandDto, SaveBrandSettingsDto } from "src/dto/panel/brand.dto";
import { I18nContext } from "nestjs-i18n";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { languages } from "src/interfaces/Translation.interface";
import { StaffRole } from "src/models/StaffRoles.schema";
import { IdDto } from "src/dto/general.dto";
import { PlanService } from "src/services/plan.service";
import { BranchDocument } from "src/models/Branches.schema";
import { User } from "src/models/Users.schema";
import { NotifsService } from "src/services/notifs.service";

@Controller("panel/brands")
export class BrandController {
    constructor(
        // ...
        private readonly fileService: FileService,
        private readonly planService: PlanService,
        private readonly notifsService: NotifsService,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
    ) {}

    @Get("/:id/settings")
    @SetPermissions("main-panel.settings")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getBrandSettings(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brand = await this.BrandModel.findOne({ _id: params.id }).select("languages currency").exec();
        if (!brand) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        const langLimit = await this.planService.checkLimitCounts<number>(brand._id, "multiple-language-limit");
        return res.json({
            languages: brand.languages,
            currency: brand.currency,
            languageLimit: langLimit,
        });
    }

    @Post("/:id/settings")
    @SetPermissions("main-panel.settings")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async saveBrandSettings(@Param() params: IdDto, @Body() body: SaveBrandSettingsDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brand = await this.BrandModel.findOne({ _id: params.id }).select("languages currency").exec();
        if (!brand) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        const langLimit = await this.planService.checkLimitCounts<number>(brand._id, "multiple-language-limit");
        if (body.languages.length > langLimit) body.languages.length = langLimit;

        await this.BrandModel.updateOne({ _id: params.id }, { languages: body.languages, currency: body.currency }).exec();
        return res.end();
    }

    // ====================================================================

    @Get("/")
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const userBrands = {};

        // get brands that user owns
        const brands = await this.BrandModel.find({ creator: req.session.userID, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
            .select("username logo name slogan")
            .exec();
        for (let i = 0; i < brands.length; i++) {
            const brand = brands[i];

            const branchCount = await this.BranchModel.countDocuments({ brand: brand._id }).exec();
            const staff = await this.StaffModel.find({ brand: brand._id }).populate<{ user: User }>("user", "avatar name family").exec();
            const staffList = staff.map((staff) => ({ avatar: staff.user.avatar, fullName: `${staff.user.name} ${staff.user.family}` }));

            userBrands[brand.id] = {
                _id: brand.id,
                logo: brand.logo,
                name: brand.name,
                slogan: brand.slogan,
                role: "owner",
                permissions: [],
                branchCount: branchCount,
                staffList: staffList,
            };
        }

        // from staff document get brands that user is part of
        const staff = await this.StaffModel.find({ user: req.session.userID })
            .populate<{ brand: Brand }>("brand", "_id logo username name slogan deletedAt")
            .populate<{ role: StaffRole }>("role", "name permissions")
            .exec();
        for (let i = 0; i < staff.length; i++) {
            const member = staff[i];
            if (!!member.brand.deletedAt) continue;

            userBrands[member.brand._id.toString()] = {
                _id: member.brand._id.toString(),
                logo: member.brand.logo,
                username: member.brand.username,
                name: member.brand.name,
                role: member.role.name,
                permissions: member.role.permissions || [],
            };
        }

        const canCreateNewBrand = brands.length > 0 ? false : true;

        return res.json({ records: Object.values(userBrands), canCreateNewBrand });
    }

    @Get("/:id")
    async getSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brand = await this.BrandModel.findOne({ creator: req.session.userID, _id: params.id }).select("logo username name slogan socials translation").exec();
        // check if user authorize to edit this record - user must be owner of brand
        if (!brand) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        const name = { default: brand.name };
        const slogan = { default: brand.slogan };
        for (const lang in languages) {
            if (brand.translation && brand.translation[lang]) {
                name[lang] = brand.translation[lang].name;
                slogan[lang] = brand.translation[lang].slogan;
            }
        }

        return res.json({ logo: brand.logo, username: brand.username, name, slogan, socials: brand.socials });
    }

    @Put("/:id")
    @UseInterceptors(FileInterceptor("logo"))
    async editRecord(
        @UploadedFile() logo: Express.Multer.File,
        @Param() params: IdDto,
        @Body() body: EditBrandDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        const brand = await this.BrandModel.findOne({
            creator: req.session.userID,
            _id: params.id,
            $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
        }).exec();
        if (!brand) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        const isUsernameTaken = await this.BrandModel.exists({ _id: { $ne: params.id }, username: body.username }).exec();
        if (isUsernameTaken) {
            throw new UnprocessableEntityException([{ property: "username", errors: [I18nContext.current().t("panel.brand.this username is already taken")] }]);
        }

        let logoLink = brand.logo;
        if (logo) {
            const uploadedFiles = await this.fileService.saveUploadedImages([logo], "logo", 1_048_576, ["png", "jpeg", "jpg", "webp"], 256, "public", "/logos");
            if (uploadedFiles[0]) {
                unlink(logoLink.replace("/file/", "storage/public/")).catch((e) => {});
                logoLink = uploadedFiles[0];
            }
        }

        const translation = {};
        for (const lang in languages) {
            if (body[`name.${lang}`] || body[`slogan.${lang}`]) {
                translation[lang] = {
                    name: body[`name.${lang}`],
                    slogan: body[`slogan.${lang}`],
                };
            }
        }

        await this.BrandModel.updateOne(
            { _id: brand._id },
            {
                logo: logoLink,
                username: body.username,
                name: body["name.default"],
                slogan: body["slogan.default"],
                socials: { instagram: body.socials_instagram, twitter: body.socials_twitter, telegram: body.socials_telegram, whatsapp: body.socials_whatsapp },
                translation: translation,
            },
        ).exec();

        if (body.username != brand.username) {
            await this.notifsService.notif({
                brand: brand._id,
                type: "brand-username-change",
                data: { oldUsername: brand.username, newUsername: body.username },
                sendAsEmail: true,
                showInSys: true,
                lang: I18nContext.current().lang,
            });
        }

        return res.json({ logo: logoLink, username: body.username, name: body["name.default"], slogan: body["slogan.default"] });
    }

    @Delete("/:id")
    async deleteSingleRecord(@Param() input: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brand = await this.BrandModel.findOne({ creator: req.session.userID, _id: input.id }).select("logo name slogan").exec();
        // check if user authorize to delete this record - user must be owner of brand
        if (!brand) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }
        // mark the record as deleted
        await this.BrandModel.updateOne({ creator: req.session.userID, _id: input.id }, { deletedAt: new Date(Date.now()) }).exec();
        // TODO : make scheduler for cleaning all the brands data (images - menus - branches - staff - ...)
        // TODO : cancel that brand's subscription
        return res.end();
    }

    @Delete("/leave/:id")
    async leaveFromBrand(@Param() input: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const staff = await this.StaffModel.findOne({ user: req.session.userID, brand: input.id }).exec();
        if (!staff) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }
        await this.StaffModel.deleteOne({ user: req.session.userID, brand: input.id }).exec();
        return res.end();
    }
}
