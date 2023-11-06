import { Body, Controller, Delete, ForbiddenException, Get, Post, Put, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { sign, verify } from "jsonwebtoken";
import { UtknDocument } from "src/models/Utkns.schema";

@Controller("utkn")
export class UtknController {
    constructor(
        // ...
        @InjectModel("Utkn") private readonly UtknModel: Model<UtknDocument>,
    ) {}

    private async generateAndSaveToken(ip: string | null, userAgent: string) {
        const payload = { ip: ip, userAgent: userAgent, iat: Date.now() };
        const token = sign(payload, process.env.JWT_SECRET, { algorithm: "HS512", expiresIn: 2_592_000 });

        await this.UtknModel.create({
            ip,
            userAgent,
            token,
            status: "active",
            expireAt: new Date(Date.now() + 2_592_000 * 1000),
            createdAt: new Date(Date.now()),
        });

        return token;
    }

    @Post("/")
    async verifyAndSaveToken(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const ip = req.headers.ipaddr?.toString() || req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || null;
        const userAgent = req.headers["user-agent"];

        const utkn = req.body.utkn || req.cookies["utkn"] || "";

        if (!utkn) {
            const token = await this.generateAndSaveToken(ip, userAgent);
            return res.json({ token });
        }

        const payload: any = verify(utkn, process.env.JWT_SECRET, { ignoreExpiration: false });
        if (typeof payload["ip"] === "undefined" || typeof payload["userAgent"] === "undefined") {
            const token = await this.generateAndSaveToken(ip, userAgent);
            return res.json({ token });
        }

        return res.end();
    }
}
