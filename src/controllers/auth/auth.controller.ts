import { Body, Controller, ForbiddenException, Post, Req, Res, UnauthorizedException, UnprocessableEntityException, Get } from "@nestjs/common";
import { Response } from "express";
import { readFile } from "fs/promises";
import { Request } from "src/interfaces/Request.interface";
import { AuthService } from "src/services/auth.service";
import { SendCodeDto } from "src/dto/auth/sendCode.dto";
import { VerifyDto } from "src/dto/auth/verify.dto";
import { RegisterDto } from "src/dto/auth/register.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { I18nContext } from "nestjs-i18n";
import { UserDocument } from "src/models/Users.schema";
import { SessionDocument } from "src/models/Sessions.schema";
import Email from "src/notifications/channels/Email";
import Sms from "src/notifications/channels/Sms";
import { NotifsService } from "src/services/notifs.service";

@Controller("auth")
export class AuthController {
    private verficationCodeExpireTime = 120; // 2 minutes

    constructor(
        private readonly authService: AuthService,
        private readonly notifsService: NotifsService,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("Session") private readonly SessionModel: Model<SessionDocument>,
    ) {}

    @Post("send-code")
    public async sendCode(@Body() inputs: SendCodeDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        let field = "mobile";
        let verificationCodeField = "mobileVerificationCode";
        const username: string = inputs.username.trim();
        const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(username);
        if (isEmail) {
            field = "email";
            verificationCodeField = "emailVerificationCode";
        }

        if (field === "mobile" && process.env.SMS_SYSTEM_STATE === "inactive") {
            throw new UnprocessableEntityException([{ property: "username", errors: [I18nContext.current().t("auth.sms system is not available right now!")] }]);
        }

        const user = await this.UserModel.findOne({ [field]: username }).exec();
        if (user) {
            if (user.status === "banned") {
                throw new UnprocessableEntityException([
                    { property: "username", errors: [I18nContext.current().t("auth.you are banned from system and can't login")] },
                ]);
            }
            // check the time of last email or sms sent
            if (!!user.verficationCodeSentAt) {
                const duration = (new Date(Date.now()).getTime() - user.verficationCodeSentAt.getTime()) / 1000;
                if (duration < this.verficationCodeExpireTime) return res.json({ expireIn: this.verficationCodeExpireTime - duration });
            }
        }

        // generate a 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000);

        // if the user does not exists before create the user
        await this.UserModel.updateOne(
            { [field]: username },
            { [verificationCodeField]: code.toString(), verficationCodeSentAt: new Date(Date.now()), createdAt: new Date(Date.now()) },
            { upsert: true },
        ).exec();

        // TODO : remove this when email and sms tempaltes are ok
        // return res.json({ code, expireIn: this.verficationCodeExpireTime });

        if (field == "email") {
            let html = await readFile(`./src/notifications/templates/${I18nContext.current().lang}/verficationEmail.html`).then((buffer) => buffer.toString());
            html = html.replace(/{{url}}/g, req.headers.origin);
            html = html.replace(/{{code}}/g, code.toString());
            await Email(`Verification Code ${code} | Menuriom`, username, html)
                .then(async () => await this.UserModel.updateOne({ email: username }, { verficationCodeSentAt: new Date(Date.now()) }).exec())
                .catch((e) => console.log(e));
        } else {
            await Sms("verify", username, null, [code.toString()], "menuriom")
                .then(async () => await this.UserModel.updateOne({ mobile: username }, { verficationCodeSentAt: new Date(Date.now()) }).exec())
                .catch((e) => console.log(e));
        }

        return res.json({ expireIn: this.verficationCodeExpireTime });
    }

    @Post("verify")
    public async verfication(@Body() inputs: VerifyDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        let field = "mobile";
        let verifiedAtField = "mobileVerifiedAt";
        let verificationCodeField = "mobileVerificationCode";
        const username: string = inputs.username.trim();
        const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(username);
        if (isEmail) {
            field = "email";
            verifiedAtField = "emailVerifiedAt";
            verificationCodeField = "emailVerificationCode";
        }

        if (field === "mobile" && process.env.SMS_SYSTEM_STATE === "inactive") {
            throw new UnprocessableEntityException([{ property: "username", errors: [I18nContext.current().t("auth.sms system is not available right now!")] }]);
        }

        const user = await this.UserModel.findOne({ [field]: username, [verificationCodeField]: inputs.code }).exec();
        if (!user)
            throw new UnprocessableEntityException([{ property: "code", errors: [I18nContext.current().t("auth.entered verification code is not correct")] }]);
        if (user.status === "banned") {
            throw new UnprocessableEntityException([{ property: "code", errors: [I18nContext.current().t("auth.you are banned from system and can't login")] }]);
        }

        // check the time with verficationCodeSentAt field
        const duration = (new Date(Date.now()).getTime() - user.verficationCodeSentAt.getTime()) / 1000;
        if (duration > this.verficationCodeExpireTime) {
            throw new UnprocessableEntityException([{ property: "code", errors: [I18nContext.current().t("auth.entered verification code has expired")] }]);
        }

        await this.UserModel.updateOne({ [field]: username, [verificationCodeField]: inputs.code }, { [verifiedAtField]: new Date(Date.now()) }).exec();

        // check if the name and family field is full
        if (!user.name || !user.family) return res.json({ register: true });

        // generate token
        const sessionID = await this.authService.createSession(req, user.id);
        const token = await this.authService.generateToken(req, sessionID, user.id);
        await this.authService.updateSession(req, sessionID, token);

        return res.json({ token, register: false });
    }

    @Post("register")
    async register(@Body() inputs: RegisterDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        let field = "mobile";
        let verifiedAtField = "mobileVerifiedAt";
        let verificationCodeField = "mobileVerificationCode";
        const username: string = inputs.username.trim();
        const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(username);
        if (isEmail) {
            field = "email";
            verifiedAtField = "emailVerifiedAt";
            verificationCodeField = "emailVerificationCode";
        }

        if (field === "mobile" && process.env.SMS_SYSTEM_STATE === "inactive") {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("auth.sms system is not available right now!")] }]);
        }

        const user = await this.UserModel.findOne({ [field]: username, [verificationCodeField]: inputs.code }).exec();
        if (!user) throw new UnauthorizedException([{ property: "", errors: [I18nContext.current().t("auth.first, please verify your email or phone number")] }]);
        if (user.status === "banned")
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("auth.you are banned from system and can't login")] }]);
        if (!user[verifiedAtField]) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("auth.first, please verify your email or phone number")] }]);
        }

        const otherUser = await this.UserModel.findOne({ mobile: inputs.mobile }).exec();
        if (otherUser && !otherUser.mobileVerifiedAt && otherUser.status != "banned") {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("auth.phone number is already in use in our system! please enter another phone number")] },
            ]);
        }
        // update user's info and set status to active
        await this.UserModel.updateOne({ _id: user._id }, { name: inputs.name, family: inputs.family, mobile: inputs.mobile, status: "active" }).exec();

        // generate token
        const sessionID = await this.authService.createSession(req, user.id);
        const token = await this.authService.generateToken(req, sessionID, user.id);
        await this.authService.updateSession(req, sessionID, token);

        await this.notifsService.notif({ user: user._id, type: "welcome-new-user", data: {}, sendAsEmail: true, showInSys: true, lang: I18nContext.current().lang });

        return res.json({ token });
    }

    @Post("continue-with-google")
    async continueWithGoogle(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        if (!req.body.profile) throw new ForbiddenException();
        const profile = req.body.profile;

        if (!profile.email_verified) {
            throw new ForbiddenException([{ property: "", errors: [I18nContext.current().t("auth.your email account is not verified by google")] }]);
        }

        let user = await this.UserModel.findOne({ email: profile.email }).exec();
        if (user) {
            if (user.status !== "active") {
                throw new ForbiddenException([{ property: "", errors: [I18nContext.current().t("auth.you are banned from system and can't login")] }]);
            }
            if (!user.googleId) await this.UserModel.updateOne({ email: profile.email }, { googleId: profile.sub, status: "active" }).exec();
        } else {
            user = await this.UserModel.create({
                googleId: profile.sub,
                avatar: profile.picture,
                email: profile.email,
                emailVerifiedAt: new Date(Date.now()),
                name: profile.given_name,
                family: profile.family_name,
                role: "user",
                status: "active",
                createdAt: new Date(Date.now()),
            });

            await this.notifsService.notif({
                user: user._id,
                type: "welcome-new-user",
                data: {},
                sendAsEmail: true,
                showInSys: true,
                lang: I18nContext.current().lang,
            });
        }

        // generate token
        const sessionID = await this.authService.createSession(req, user.id);
        const token = await this.authService.generateToken(req, sessionID, user.id);
        await this.authService.updateSession(req, sessionID, token);

        return res.json({ token });
    }

    @Post("refresh")
    async refresh(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        /* 
            TODO : if the family lenth reaches the limit then revoke the session and create new one
        */

        /*
            NOTE :
            for better security it's good to lower the refresh time limit - if the time is removed then hijacked token no longer is valid as soon as this api is called

            but invalidatiing an used token need a online user to call refresh api
            for better security its best to revoke the token after set amount of time with a job (if refresh interval is 10 minutes this job should run every 11 minutes)
        */

        // let token = "";
        // if (!token && req.cookies["AuthToken"]) token = req.cookies["AuthToken"].toString();
        // if (!token && req.headers["authtoken"]) token = req.headers["authtoken"].toString();

        // if (token === null || token === "") throw new UnauthorizedException(-1);

        const sessionID = req.session.sessionID;
        const userID = req.session.userID;
        // const FamilyLength = parseInt(process.env.ACCESS_TOKEN_FAMILY_LENGTH);

        const session = await this.SessionModel.findOne({ _id: new Types.ObjectId(sessionID), user: new Types.ObjectId(userID), status: "active" }).exec();

        // check the updatedAt field and if it is passed the refresh rate mark
        const refreshInterval = 60; // 1 minutes
        if (session.updatedAt >= new Date(Date.now() - refreshInterval * 1000)) throw new ForbiddenException(-1);

        // check the family length and make new session if it passed the limit
        // if (session.accessTokenFamily.length >= FamilyLength) {
        //     // revoke the old session
        //     await this.SessionModel.updateOne({ _id: sessionID }, { status: "revoked" });
        //     // create new session
        //     sessionID = await this.authService.createSession(req, userID);
        //     session = await this.SessionModel.findOne({ _id: sessionID });
        // }

        // generate token
        // const newToken = this.authService.generateToken(req, sessionID, userID);
        // const family = new Set([...session.accessTokenFamily, token]);
        // await this.authService.updateSession(req, sessionID, newToken, Array.from(family));

        // generate token
        const newToken = await this.authService.generateToken(req, sessionID, userID);
        await this.authService.updateSession(req, sessionID, newToken);

        return res.json({ token: newToken });
    }

    @Post("logout")
    async logout(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const sessionID = req.session.sessionID;
        const userID = req.session.userID;
        await this.SessionModel.updateOne({ _id: sessionID, user: userID, status: "active" }, { status: "revoked" }).exec();

        return res.end();
    }

    @Post("check-if-role/:role")
    async checkIfRole(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        if (req.params.role !== "admin") throw new ForbiddenException();

        const user = await this.UserModel.findOne({ _id: req.session.userID }).exec();
        if (user.role !== req.params.role) throw new ForbiddenException();

        return res.end();
    }
}
