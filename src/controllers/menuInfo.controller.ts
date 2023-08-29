import { Body, Controller, Get, Post, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { Request, Response } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MenuSytleDocument } from "src/models/MenuStyles.schema";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("menu-info")
export class MenuInfoController {
    constructor(
        // ...
        @InjectModel("MenuStyle") private readonly MenuSytleModel: Model<MenuSytleDocument>,
    ) {}

    @Get("/menu-styles")
    async loadMenuStyles(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const menuStyles = await this.MenuSytleModel.findOne({ brand: brandID }).lean();

        return res.json({ menuStyles });
    }
}
