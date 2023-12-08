import { Body, Controller, Delete, ForbiddenException, Get, Post, Put, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { StaffRole } from "src/models/StaffRoles.schema";
import { UserDocument } from "src/models/Users.schema";
import { readFile, unlink } from "fs/promises";
import { FileInterceptor } from "@nestjs/platform-express";
import { CompleteInfoDto, EditUserInfoDto, SendEmailVerificationDto, SendMobilelVerificationDto, VerifyCodeDto } from "src/dto/panel/user.dto";
import { I18nContext } from "nestjs-i18n";
import { Brand, BrandDocument } from "src/models/Brands.schema";
import { StaffDocument } from "src/models/Staff.schema";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { Plan } from "src/models/Plans.schema";
import { FileService } from "src/services/file.service";
import Email from "src/notifications/channels/Email";
import Sms from "src/notifications/channels/Sms";

@Controller("user")
export class UserController {
    private verficationCodeExpireTime = 120; // 2 minutes

    constructor(
        private readonly fileService: FileService,
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

        // get brands that user owns
        const brands = await this.BrandModel.find({ creator: user.id, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
            .select("logo username name slogan")
            .exec();
        for (let i = 0; i < brands.length; i++) {
            const brand = brands[i];
            userBrands[brand.id] = { logo: brand.logo, username: brand.username, name: brand.name, slogan: brand.slogan, role: "owner", permissions: [] };
        }

        // from staff document get brands that user has with permissions
        const staff = await this.StaffModel.find({ user: user.id })
            .populate<{ brand: Brand }>("brand", "_id logo username name slogan deletedAt")
            .populate<{ role: StaffRole }>("role", "name permissions")
            .exec();
        for (let i = 0; i < staff.length; i++) {
            const member = staff[i];
            if (!!member.brand.deletedAt) continue;
            userBrands[member.brand._id.toString()] = {
                logo: member.brand.logo,
                username: member.brand.username,
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

    @Post("change-email")
    async changeUserEmail(@Body() inputs: SendEmailVerificationDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        if (!user) throw NotFoundException;

        if (user.email === inputs.email) throw new ForbiddenException();

        // check email duplication
        const emailAlreadyExists = await this.UserModel.exists({
            _id: { $ne: req.session.userID },
            email: inputs.email,
            status: "active",
            $and: [{ emailVerifiedAt: { $exists: true } }, { emailVerifiedAt: { $ne: null } }],
        }).exec();
        if (emailAlreadyExists) {
            throw new UnprocessableEntityException([{ property: "email", errors: [I18nContext.current().t("panel.user.this email address already exists!")] }]);
        }

        // check the time of last email or sms sent
        if (!!user.emailVerficationCodeSentAt) {
            const duration = (new Date(Date.now()).getTime() - user.emailVerficationCodeSentAt.getTime()) / 1000;
            if (duration < this.verficationCodeExpireTime) return res.json({ expireIn: this.verficationCodeExpireTime - duration });
        }

        // generate a 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000);

        await this.UserModel.updateOne(
            { _id: req.session.userID },
            { emailInVerfication: inputs.email, emailVerificationCode: code, emailVerficationCodeSentAt: new Date(Date.now()) },
        ).exec();

        // TODO : remove this when email and sms tempaltes are ok
        // return res.json({ code, expireIn: this.verficationCodeExpireTime });

        let html = await readFile(`./src/notifications/templates/${I18nContext.current().lang}/verficationEmail.html`).then((buffer) => buffer.toString());
        html = html.replace(/{{url}}/g, req.headers.origin);
        html = html.replace("{{code}}", code.toString());
        await Email(`Verification Code ${code} | Menuriom`, inputs.email, html)
            .then(async () => await this.UserModel.updateOne({ email: inputs.email }, { verficationCodeSentAt: new Date(Date.now()) }).exec())
            .catch((e) => console.log(e));

        return res.json({ expireIn: this.verficationCodeExpireTime });
    }

    @Post("verify-email")
    async verifyUserEmail(@Body() inputs: VerifyCodeDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        if (!user) throw NotFoundException;

        if (user.emailVerificationCode !== inputs.code) {
            throw new UnprocessableEntityException([{ property: "code", errors: [I18nContext.current().t("auth.entered verification code is not correct")] }]);
        }

        const duration = (new Date(Date.now()).getTime() - user.emailVerficationCodeSentAt.getTime()) / 1000;
        if (duration > this.verficationCodeExpireTime) {
            throw new UnprocessableEntityException([{ property: "code", errors: [I18nContext.current().t("auth.entered verification code has expired")] }]);
        }

        await this.UserModel.updateOne(
            { _id: req.session.userID },
            { email: user.emailInVerfication, emailInVerfication: null, emailVerifiedAt: new Date(Date.now()) },
        ).exec();

        return res.json({ email: user.emailInVerfication });
    }

    @Post("change-mobile")
    async changeUserMobile(@Body() inputs: SendMobilelVerificationDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        if (!user) throw NotFoundException;

        if (user.mobile === inputs.mobile) throw new ForbiddenException();

        // check mobile duplication
        const mobileAlreadyExists = await this.UserModel.exists({
            _id: { $ne: req.session.userID },
            mobile: inputs.mobile,
            status: "active",
            $and: [{ mobileVerifiedAt: { $exists: true } }, { mobileVerifiedAt: { $ne: null } }],
        }).exec();
        if (mobileAlreadyExists) {
            throw new UnprocessableEntityException([{ property: "mobile", errors: [I18nContext.current().t("panel.user.this mobile already exists!")] }]);
        }

        // check the time of last mobile or sms sent
        if (!!user.mobileVerficationCodeSentAt) {
            const duration = (new Date(Date.now()).getTime() - user.mobileVerficationCodeSentAt.getTime()) / 1000;
            if (duration < this.verficationCodeExpireTime) return res.json({ expireIn: this.verficationCodeExpireTime - duration });
        }

        // generate a 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000);

        await this.UserModel.updateOne(
            { _id: req.session.userID },
            { mobileInVerfication: inputs.mobile, mobileVerificationCode: code, mobileVerficationCodeSentAt: new Date(Date.now()) },
        ).exec();

        // TODO : remove this when email and sms tempaltes are ok
        // return res.json({ code, expireIn: this.verficationCodeExpireTime });

        // TODO : do the templates and stuff
        await Sms("verify", inputs.mobile, null, [code.toString()], "menuriom")
            .then(async () => await this.UserModel.updateOne({ mobile: inputs.mobile }, { verficationCodeSentAt: new Date(Date.now()) }).exec())
            .catch((e) => console.log(e));

        return res.json({ expireIn: this.verficationCodeExpireTime });
    }

    @Post("verify-mobile")
    async verifyUserMobile(@Body() inputs: VerifyCodeDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        if (!user) throw NotFoundException;

        if (user.mobileVerificationCode !== inputs.code) {
            throw new UnprocessableEntityException([{ property: "code", errors: [I18nContext.current().t("auth.entered verification code is not correct")] }]);
        }

        const duration = (new Date(Date.now()).getTime() - user.mobileVerficationCodeSentAt.getTime()) / 1000;
        if (duration > this.verficationCodeExpireTime) {
            throw new UnprocessableEntityException([{ property: "code", errors: [I18nContext.current().t("auth.entered verification code has expired")] }]);
        }

        await this.UserModel.updateOne(
            { _id: req.session.userID },
            { mobile: user.mobileInVerfication, mobileInVerfication: null, mobileVerifiedAt: new Date(Date.now()) },
        ).exec();

        return res.json({ mobile: user.mobileInVerfication });
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

    @Put("edit-info")
    @UseInterceptors(FileInterceptor("avatar"))
    async editUserInfo(
        @UploadedFile() avatar: Express.Multer.File,
        @Body() input: EditUserInfoDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        if (!user) throw new NotFoundException([{ property: "user", errors: [I18nContext.current().t("panel.user.user not found")] }]);

        let avatarLink = user.avatar || "";
        if (avatar) {
            const uploadedFile = await this.fileService.saveUploadedImages([avatar], "avatar", 1_048_576, ["png", "jpeg", "jpg", "webp"], 128, "public", "/avatars");
            if (uploadedFile[0]) {
                unlink(avatarLink.replace("/file/", "storage/public/")).catch((e) => {});
                avatarLink = uploadedFile[0];
            }
        }

        await this.UserModel.updateOne({ _id: req.session.userID }, { avatar: avatarLink, name: input.name, family: input.family }).exec();

        return res.json({ avatar: avatarLink, name: input.name, family: input.family });
    }

    @Delete("delete-avatar-image")
    async deleteUserImage(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).select("-_v -password -createdAt").exec();
        if (!user) throw new NotFoundException([{ property: "user", errors: [I18nContext.current().t("panel.user.user not found")] }]);

        // delete the old image from system
        if (!!user.avatar) await unlink(user.avatar.replace("/file/", "storage/public/")).catch((e) => {});
        // delete image form db
        await this.UserModel.updateOne({ _id: req.session.userID }, { avatar: "" });

        return res.json();
    }
}
