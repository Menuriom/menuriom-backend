import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UtknDocument } from "src/models/Utkns.schema";

@Controller("menu")
export class LikeController {
    constructor(
        // ...
        @InjectModel("Utkn") private readonly UtknModel: Model<UtknDocument>,
    ) {}

    @Get("/")
    async ttttt(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        return res.end();
    }
}
