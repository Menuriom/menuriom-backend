import { Body, Controller, Delete, Get, Post, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { StaffPermissionDocument } from "src/models/StaffPermissions.schema";
import { StaffRole, StaffRoleDocument } from "src/models/StaffRoles.schema";
import { UserDocument } from "src/models/Users.schema";
import { unlink } from "fs/promises";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CompleteInfoDto, EditUserInfoDto } from "src/dto/panel/user.dto";
import { I18nContext } from "nestjs-i18n";
import { Brand, BrandDocument } from "src/models/Brands.schema";
import { StaffDocument } from "src/models/Staff.schema";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { Plan } from "src/models/Plans.schema";

@Controller("user")
export class UserController {
    constructor(
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
    ) {}

    @Get("info")
    async getUser(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).select("-_v -password -createdAt").exec();
        if (!user) throw NotFoundException;

        const userBrands = {};

        // TODO : add brand plan limitation for each brand so that front middleware can check for them

        // get brands that user owns
        const brands = await this.BrandModel.find({ creator: user.id, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
            .select("logo name slogan")
            .exec();
        for (let i = 0; i < brands.length; i++) {
            const brand = brands[i];
            userBrands[brand.id] = { logo: brand.logo, name: brand.name, slogan: brand.slogan, role: "owner", permissions: [] };
        }

        // from staff document get brands that user has with permissions
        const staff = await this.StaffModel.find({ user: user.id })
            .populate<{ brand: Brand }>("brand", "_id logo name slogan deletedAt")
            .populate<{ role: StaffRole }>("role", "name permissions")
            .exec();
        for (let i = 0; i < staff.length; i++) {
            const member = staff[i];
            if (!!member.brand.deletedAt) continue;
            // TODO : get list of roles from branches in staffModel
            userBrands[member.brand._id.toString()] = {
                logo: member.brand.logo,
                name: member.brand.name,
                slogan: member.brand.slogan,
                role: member.role.name,
                permissions: member.role.permissions,
            };
        }

        // add brand limitations
        const brandsPlans = await this.BrandsPlanModel.find({ brand: { $in: Object.keys(userBrands) } })
            .select("_id brand")
            .populate<{ currentPlan: Plan }>("currentPlan", "_id limitations")
            .exec();
        brandsPlans.forEach((brandsPlan) => (userBrands[brandsPlan.brand.toString()]["limitations"] = brandsPlan.currentPlan.limitations));

        return res.json({
            avatar: user.avatar,
            name: user.name,
            family: user.family,
            email: user.email,
            mobile: user.mobile,
            brands: userBrands,
        });
    }

    @Get("check-verification")
    async checkVerification(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).select("-_v -password -createdAt").exec();
        if (!user) throw NotFoundException;

        return res.json({
            emailVerified: !!user.emailVerifiedAt,
            mobileVerified: !!user.mobileVerifiedAt,
        });
    }

    @Post("complete-info")
    async completeInfo(@Body() input: CompleteInfoDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).select("-_v -password -createdAt").exec();
        if (!user) throw NotFoundException;

        const otherUser = await this.UserModel.findOne({ mobile: input.mobile }).exec();
        if (otherUser && !otherUser.mobileVerifiedAt && otherUser.status != "banned") {
            throw new UnprocessableEntityException([
                {
                    property: "mobile",
                    errors: [I18nContext.current().t("auth.phone number is already in use in our system! please enter another phone number")],
                },
            ]);
        }

        await this.UserModel.updateOne({ id: user.id }, { name: input.name, family: input.family, mobile: input.mobile }).exec();

        return res.json({ ...input });
    }

    @Post("edit-info")
    async editUserInfo(@Body() input: EditUserInfoDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        if (!user) throw new NotFoundException([{ property: "user", errors: [I18nContext.current().t("panel.user.user not found")] }]);

        await this.UserModel.updateOne({ _id: req.session.userID }, { name: input.name, family: input.family });

        return res.json();
    }

    @Post("edit-avatar-image")
    @UseInterceptors(FilesInterceptor("files"))
    async editUserImage(@UploadedFiles() files: Array<Express.Multer.File>, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        if (!user) throw new NotFoundException([{ property: "user", errors: [I18nContext.current().t("panel.user.user not found")] }]);

        if (!!files.length) {
            const ogName = files[0].originalname;
            const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);

            // check file size
            if (files[0].size > 1_048_576) {
                throw new UnprocessableEntityException([
                    { property: "image", errors: [I18nContext.current().t("panel.user.size of avatar pic must be less than 1M")] },
                ]);
            }

            // check file format
            const isMimeOk = extension == "png" || extension == "jpeg" || extension == "jpg";
            if (!isMimeOk)
                throw new UnprocessableEntityException([{ property: "image", errors: [I18nContext.current().t("panel.user.image format is not valid")] }]);

            // delete the old image from system
            if (!!user.avatar) await unlink(user.avatar.replace("/file/", "storage/")).catch((e) => {});

            // TODO
            // const randName = randStr(10);
            // const img = sharp(Buffer.from(files[0].buffer));
            // img.resize(256);
            // const url = `storage/public/user_avatars/${randName}.${extension}`;
            // await img.toFile(url).catch((e) => console.log(e));

            // const imageLink = url.replace("storage/", "/file/");
            // await this.UserModel.updateOne({ _id: req.session.userID }, { image: imageLink });

            // return res.json({ imageLink });
        }

        return res.json({ imageLink: user.avatar });
    }

    @Delete("delete-avatar-image")
    async deleteUserImage(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).select("-_v -password -createdAt").exec();
        if (!user) throw new NotFoundException([{ property: "user", errors: [I18nContext.current().t("panel.user.user not found")] }]);

        // delete the old image from system
        if (!!user.avatar) await unlink(user.avatar.replace("/file/", "storage/")).catch((e) => {});
        // delete image form db
        await this.UserModel.updateOne({ _id: req.session.userID }, { avatar: "" });

        return res.json();
    }
}
