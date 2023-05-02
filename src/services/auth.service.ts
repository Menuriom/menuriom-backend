import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { sign } from "jsonwebtoken";
import { payload, Request } from "src/interfaces/Request.interface";
import { Model } from "mongoose";
import { SessionDocument } from "src/models/Sessions.schema";
import { UserDocument } from "src/models/Users.schema";
import { BrandDocument } from "src/models/Brands.schema";
import { StaffDocument } from "src/models/Staff.schema";

@Injectable()
export class AuthService {
    constructor(
        // ...
        @InjectModel("Session") private readonly SessionModel: Model<SessionDocument>,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("Staff") private readonly StaffModel: Model<StaffDocument>,
    ) {}

    async createSession(req: Request, userID: string): Promise<string> {
        const ip = req.headers.ipaddr || req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
        const userAgent = req.headers["user-agent"];

        const session = await this.SessionModel.create({
            user: userID,
            ip: ip,
            userAgent: userAgent,
            expireAt: new Date(Date.now() + parseInt(process.env.SESSION_EXPIRE_TIME) * 1000),
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
        });

        return session.id;
    }

    async updateSession(req: Request, sessionID: string, token: string, family: Array<string> = []): Promise<void> {
        const ip = req.headers.ipaddr || req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
        const userAgent = req.headers["user-agent"];

        await this.SessionModel.updateOne(
            { _id: sessionID },
            {
                ip: ip,
                userAgent: userAgent,
                accessTokenFamily: family,
                currentlyInUseToken: token,
                expireAt: new Date(Date.now() + parseInt(process.env.SESSION_EXPIRE_TIME) * 1000),
                updatedAt: new Date(Date.now()),
            },
        ).exec();
    }

    async generateToken(req: Request, sessionID: string, userID: string): Promise<string> {
        const ip = req.headers.ipaddr || req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
        const userAgent = req.headers["user-agent"];

        const payload: payload = {
            sessionID: sessionID,
            userID: userID,
            ipAddr: ip,
            userAgent: userAgent,
        };

        const token = sign({ ...payload, iat: Date.now() }, process.env.JWT_SECRET, {
            algorithm: "HS512",
            expiresIn: parseInt(process.env.SESSION_EXPIRE_TIME),
        });

        return token;
    }

    async isUserAuthorize(req: Request, brandID: string, permissionsToCheck: string[] = [], operator: "OR" | "AND" = "OR"): Promise<boolean> {
        // check if user is owner
        const isUserOwner = await this.BrandModel.exists({ _id: brandID, creator: req.session.userID }).exec();
        if (isUserOwner) return true;

        const staff = await this.StaffModel.findOne({ brand: brandID, user: req.session.userID }).populate("role", "name permissions").exec();
        if (!staff) return false;
        const userPermissions = [...staff.role.permissions];

        // then check the requested permission list agains it
        if (operator == "AND") {
            for (let i = 0; i < permissionsToCheck.length; i++) if (userPermissions.indexOf(permissionsToCheck[i]) == -1) return false;
            return true;
        } else {
            for (let i = 0; i < permissionsToCheck.length; i++) if (userPermissions.indexOf(permissionsToCheck[i]) != -1) return true;
            return false;
        }
        return false;
    }
}
