import { Body, Controller, Delete, Get, Post, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserDocument } from "src/models/Users.schema";
import { BrandDocument } from "src/models/Brands.schema";
import { BranchDocument } from "src/models/Branches.schema";
import { unlink } from "fs/promises";
import { FileService } from "src/services/file.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { SetupBrandDto } from "src/dto/panel/account.dto";
import { I18nContext } from "nestjs-i18n";
import { StaffRoleDefaultDocument } from "src/models/StaffRoleDefaults.schema";
import { StaffRoleDocument } from "src/models/StaffRoles.schema";

@Controller("account")
export class AccountController {
    constructor(
        // ...
        private readonly fileService: FileService,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("Branch") private readonly BranchModel: Model<BranchDocument>,
        @InjectModel("StaffRoleDefault") private readonly StaffRoleDefaultModel: Model<StaffRoleDefaultDocument>,
        @InjectModel("StaffRole") private readonly StaffRoleModel: Model<StaffRoleDocument>,
    ) {}

    @Post("/setup-brand")
    @UseInterceptors(FileInterceptor("logo"))
    async setupBrand(@UploadedFile() logo: Express.Multer.File, @Body() input: SetupBrandDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        // check if user already has a brand then dont allow new brand creation
        const userBrand = await this.BrandModel.exists({ creator: req.session.userID, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }).exec();
        if (userBrand) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.brand.You can only create 1 brand!")] }]);
        }

        if (!logo) {
            throw new UnprocessableEntityException([{ property: "logo", errors: [I18nContext.current().t("panel.brand.Please select your brand logo")] }]);
        }
        const logoLink = await this.fileService.saveUploadedImages([logo], "logo", 1_048_576, ["png", "jpeg", "jpg", "webp"], 256, "public", "/logos");

        // creating user's first brand
        const newBrand = await this.BrandModel.create({
            logo: logoLink[0],
            name: input.name,
            slogan: input.slogan,
            branchSize: input.branchSize,
            creator: req.session.userID,
            createdAt: new Date(Date.now()),
        });

        // creating user's first branch
        await this.BranchModel.create({
            brand: newBrand.id,
            name: I18nContext.current().t("panel.brand.Main Branch"),
            address: input.address,
            telephoneNumbers: input.tel,
            createdAt: new Date(Date.now()),
        });

        // adding default roles to brand staff roles
        const defaultRoles = await this.StaffRoleDefaultModel.find().exec();
        const roles = defaultRoles.map((role) => {
            return { brand: newBrand.id, name: role.name, permissions: role.permissions, translation: role.translation };
        });
        await this.StaffRoleModel.insertMany(roles);

        return res.json({
            newId: newBrand.id,
            brand: { [newBrand.id]: { logo: newBrand.logo, name: newBrand.name, role: "owner", permissions: [] } },
        });
    }
}
