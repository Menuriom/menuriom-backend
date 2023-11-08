import { Body, Controller, Get, Param, Post, Req, Res } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Request, Response } from "express";
// import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UtknDocument } from "src/models/Utkns.schema";
import { LikeDocument } from "src/models/Likes.schema";
import { IsMongoId } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { ItemIdDto } from "src/dto/menu/like.dto";
import { MenuItemDocument } from "src/models/MenuItems.schema";

@Controller("menu")
export class LikeController {
    constructor(
        // ...
        @InjectModel("Utkn") private readonly UtknModel: Model<UtknDocument>,
        @InjectModel("Like") private readonly LikeModel: Model<LikeDocument>,
        @InjectModel("MenuItem") private readonly MenuItemModel: Model<MenuItemDocument>,
    ) {}

    // TODO
    // its better to force users to login for giving likes, just like comment and ordering
    // only free tier menus users dont need any authentication

    @Get("/like/:itemID")
    async checkLike(@Param() params: ItemIdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const session = req["utknSession"] || {};

        const isUserLikedItem = await this.LikeModel.exists({ menuItem: params.itemID, utkn: session._id }).exec();
        return res.json({ liked: !!isUserLikedItem });
    }

    @Post("/like/:itemID")
    async toggleLike(@Param() params: ItemIdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const session = req["utknSession"] || {};

        const menuItem = await this.MenuItemModel.findOne({ _id: params.itemID }).select("likes").exec();
        if (!menuItem) throw NotFoundException;

        const isUserLikedItem = await this.LikeModel.exists({ menuItem: params.itemID, utkn: session._id }).exec();
        if (isUserLikedItem) {
            await this.LikeModel.deleteOne({ menuItem: params.itemID, utkn: session._id }).exec();
            await this.MenuItemModel.updateOne({ _id: params.itemID }, { $inc: { likes: -1 } }).exec();
        } else {
            await this.LikeModel.create({ menuItem: params.itemID, utkn: session._id, createdAt: new Date(Date.now()) }).catch((e) => {});
            await this.MenuItemModel.updateOne({ _id: params.itemID }, { $inc: { likes: 1 } }).exec();
        }

        return res.json({ likeState: !isUserLikedItem, totalLikes: isUserLikedItem ? menuItem.likes - 1 : menuItem.likes + 1 });
        // return res.json({ likeState: !isUserLikedItem, totalLikes: menuItem.likes });
    }
}
