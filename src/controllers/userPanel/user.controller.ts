import { Body, Controller, Delete, Get, Post, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserPermissionDocument } from "src/models/UserPermissions.schema";
import { UserPermissionGroupDocument } from "src/models/UserPermissionGroups.schema";
import { UserDocument } from "src/models/Users.schema";
import { unlink } from "fs/promises";
import { FilesInterceptor } from "@nestjs/platform-express";
import { EditUserInfoDto } from "src/dto/userPanel/user.dto";

@Controller("user")
export class UserController {
    private verficationCodeExpireTime = 120; // 2 minutes

    constructor(
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("PermissionGroup") private readonly PermissionGroupModel: Model<UserPermissionGroupDocument>,
        @InjectModel("Permission") private readonly PermissionModel: Model<UserPermissionDocument>,
    ) {}

    @Get("info")
    async getUser(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).select("-_v -password -createdAt").exec();
        if (!user) throw NotFoundException;

        // TODO
        // const permissions = new Set();
        // if (!!user.permissions) user.permissions.forEach((permission) => permissions.add(permission));
        // if (!!user.permissionGroup) user.permissionGroup.permissions.forEach((permission) => permissions.add(permission));

        return res.json({
            avatar: user.avatar,
            name: user.name,
            family: user.family,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            permissions: [],
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

    @Post("edit-info")
    async editUserInfo(@Body() input: EditUserInfoDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        if (!user) throw new NotFoundException([{ property: "user", errors: ["کاربر پیدا نشد"] }]);

        await this.UserModel.updateOne({ _id: req.session.userID }, { name: input.name, family: input.family });

        return res.json();
    }

    @Post("edit-avatar-image")
    @UseInterceptors(FilesInterceptor("files"))
    async editUserImage(@UploadedFiles() files: Array<Express.Multer.File>, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        if (!user) throw new NotFoundException([{ property: "user", errors: ["کاربر پیدا نشد"] }]);

        if (!!files.length) {
            const ogName = files[0].originalname;
            const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);

            // check file size
            if (files[0].size > 2097152) throw new UnprocessableEntityException([{ property: "image", errors: ["حجم فایل باید کمتر از 2Mb باشد"] }]);

            // check file format
            let isMimeOk = extension == "png" || extension == "gif" || extension == "jpeg" || extension == "jpg";
            if (!isMimeOk) throw new UnprocessableEntityException([{ property: "image", errors: ["فرمت فایل معتبر نیست"] }]);

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
        if (!user) throw new NotFoundException([{ property: "user", errors: ["کاربر پیدا نشد"] }]);

        // delete the old image from system
        if (!!user.avatar) await unlink(user.avatar.replace("/file/", "storage/")).catch((e) => {});
        // delete image form db
        await this.UserModel.updateOne({ _id: req.session.userID }, { avatar: "" });

        return res.json();
    }
}
