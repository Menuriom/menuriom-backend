import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { sign } from "jsonwebtoken";
import { payload, Request } from "src/interfaces/Request.interface";
import { Model } from "mongoose";
import { SessionDocument } from "src/models/sessions.schema";
import { UserDocument } from "src/models/users.schema";

// interface generateTokenResults {
//     payload: payload & JwtPayload;
//     token: string;
// }

@Injectable()
export class AuthService {
    constructor(
        @InjectModel("Session") private readonly SessionModel: Model<SessionDocument>,
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
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
            { id: sessionID },
            {
                ip: ip,
                userAgent: userAgent,
                accessTokenFamily: family,
                currentlyInUseToken: token,
                expireAt: new Date(Date.now() + parseInt(process.env.SESSION_EXPIRE_TIME) * 1000),
                updatedAt: new Date(Date.now()),
            },
        );
    }

    generateToken(req: Request, sessionID: string, userID: string): string {
        const ip = req.headers.ipaddr || req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
        const userAgent = req.headers["user-agent"];

        const payload: payload = {
            sessionID: sessionID,
            userID: userID,
            ipAddr: ip,
            userAgent: userAgent,
        };

        const token = sign(payload, process.env.JWT_SECRET, {
            algorithm: "HS512",
            expiresIn: parseInt(process.env.SESSION_EXPIRE_TIME),
        });

        return token;
    }

    // async authorize(req: Request, role: string, permissionsToCheck: string[] = [], style: "OR" | "AND" = "OR") {
    //     // check the role
    //     if (req.user.user.role !== role) return false;

    //     // get the user
    //     const user = await this.UserModel.findOne({ _id: req.user["payload"].user_id })
    //         .select("-_v -password -createdAt")
    //         .populate("permissionGroup", "-_id name permissions")
    //         .exec();
    //     if (!user) return false;

    //     // list the user's permissions base on both permissionGroup and permissions
    //     const userPermissionsSet = new Set();
    //     if (!!user.permissions) user.permissions.forEach((permission) => userPermissionsSet.add(permission));
    //     if (!!user.permissionGroup) user.permissionGroup.permissions.forEach((permission) => userPermissionsSet.add(permission));
    //     const userPermissions = [...userPermissionsSet];

    //     // then check the requested permission list agains it
    //     if (style == "AND") {
    //         for (let i = 0; i < permissionsToCheck.length; i++) if (userPermissions.indexOf(permissionsToCheck[i]) == -1) return false;
    //         return true;
    //     } else {
    //         for (let i = 0; i < permissionsToCheck.length; i++) if (userPermissions.indexOf(permissionsToCheck[i]) != -1) return true;
    //         return false;
    //     }

    //     return false;
    // }
}
