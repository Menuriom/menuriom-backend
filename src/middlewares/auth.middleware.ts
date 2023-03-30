import { ForbiddenException, Injectable, NestMiddleware, Req, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Response, NextFunction } from "express";
import { Request } from "src/interfaces/Request.interface";
import { verify } from "jsonwebtoken";
import { Model } from "mongoose";
import { SessionDocument } from "src/models/sessions.schema";
import { UserDocument } from "src/models/users.schema";

/*
    Making sure the user is logged in
*/
@Injectable()
export class AuthCheckMiddleware implements NestMiddleware {
    constructor(
        @InjectModel("Session") private readonly SessionModel: Model<SessionDocument>,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        let token = "";
        if (!token && req.cookies["AuthToken"]) token = req.cookies["AuthToken"].toString();
        if (!token && req.headers["authtoken"]) token = req.headers["authtoken"].toString();

        if (token === null || token === "") throw new UnauthorizedException(-1);

        const payload: any = verify(token, process.env.JWT_SECRET);

        if (typeof payload["userID"] === "undefined") throw new UnauthorizedException(-2);
        if (typeof payload["sessionID"] === "undefined") throw new UnauthorizedException(-3);

        // get the session
        const session = await this.SessionModel.findOne({ _id: payload["sessionID"], user: payload["userID"], status: "active" });
        if (!session) throw new UnauthorizedException(-4);

        // check the updatedAt field and if it is passed the refresh rate mark
        const refreshInterval = 60 * 15; // 15 minutes
        if (session.updatedAt >= new Date(Date.now() - refreshInterval * 1000)) throw new UnauthorizedException(-5);

        // check if session is expired
        if (payload["iat"] * 1000 < Date.now() - parseInt(process.env.SESSION_EXPIRE_TIME) * 1000) throw new UnauthorizedException(-6);

        // check if token matches the current access token
        if (token !== session.currentlyInUseToken) {
            // check the token family list and if token is in that list then revoke the whole session and return 401
            // if (session.accessTokenFamily.includes(token)) await this.SessionModel.updateOne({ _id: session.id }, { status: "revoked" });

            await this.SessionModel.updateOne({ _id: session.id }, { status: "revoked" });
            throw new UnauthorizedException(-7);
        }

        const user = await this.UserModel.findOne({ _id: payload["userID"], status: "active" }).exec();
        if (!user) throw new UnauthorizedException(-8);

        req.session = payload;

        return next();
    }
}

/*
    Making sure no user is logged in
*/
@Injectable()
export class GuestMiddleware implements NestMiddleware {
    constructor(@InjectModel("Session") private readonly SessionModel: Model<SessionDocument>) {}

    async use(req: Request, res: Response, next: NextFunction) {
        let token = "";
        if (!token && req.cookies["AuthToken"]) token = req.cookies["AuthToken"].toString();
        if (!token && req.headers["authtoken"]) token = req.headers["authtoken"].toString();

        if (token === null || token === "") return next();

        const payload: any = verify(token, process.env.JWT_SECRET);

        if (typeof payload["userID"] === "undefined") return next();
        if (typeof payload["sessionID"] === "undefined") return next();

        // get the session
        const session = await this.SessionModel.findOne({ _id: payload["sessionID"], user: payload["userID"], status: "active" });
        if (!session) return next();

        // check if session is expired
        if (payload["iat"] * 1000 < Date.now() - parseInt(process.env.SESSION_EXPIRE_TIME) * 1000) return next();

        // check if token matches the current access token
        if (token !== session.currentlyInUseToken) {
            await this.SessionModel.updateOne({ _id: session.id }, { status: "revoked" });
            return next();
        }

        throw new ForbiddenException();
    }
}
