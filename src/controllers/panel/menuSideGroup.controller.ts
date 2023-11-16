import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { I18nContext } from "nestjs-i18n";
import { languages } from "src/interfaces/Translation.interface";
import { IdDto } from "src/dto/general.dto";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { PlanService } from "src/services/plan.service";
import { FileService } from "src/services/file.service";
import { MenuService } from "src/services/menu.service";
import { MenuSideGroupDocument } from "src/models/MenuSideGroups.schema";
import { CreateNewSideGroupDto, EditSideGroupDto } from "src/dto/panel/sideGroup.dto";
import { CheckUnpaidInvoiceInSelectedBrand } from "src/guards/billExpiration.guard";

@Controller("panel/menu-sides")
export class MenuSideGroupController {
    constructor(
        // ...
        readonly PlanService: PlanService,
        readonly FileService: FileService,
        readonly MenuService: MenuService,
        @InjectModel("MenuSideGroup") private readonly MenuSideGroupModel: Model<MenuSideGroupDocument>,
    ) {}

    @Get("/")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];
        const groups = await this.MenuSideGroupModel.find({ brand: brandID }).select("_id name description items maxNumberUserCanChoose translation").exec();
        const groupCount = await this.MenuSideGroupModel.countDocuments({ brand: brandID }).exec();

        return res.json({ records: groups, canCreateNewGroup: groupCount < 100 });
    }

    @Get("/:id")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const group = await this.MenuSideGroupModel.findOne({ _id: params.id }).select("_id name description items maxNumberUserCanChoose translation").exec();
        if (!group) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        const name = { default: group.name };
        const description = { default: group.description };
        for (const lang in languages) {
            if (group.translation && group.translation[lang]) {
                name[lang] = group.translation[lang].name;
                description[lang] = group.translation[lang].description;
            }
        }

        return res.json({ name, description, items: group.items, maximum: group.maxNumberUserCanChoose });
    }

    @Post("/")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand, CheckUnpaidInvoiceInSelectedBrand)
    @UseInterceptors(FileInterceptor("uploadedFile"))
    async addRecord(@Body() body: CreateNewSideGroupDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const groupCount = await this.MenuSideGroupModel.countDocuments({ brand: brandID }).exec();
        if (groupCount >= 100) {
            throw new UnprocessableEntityException([{ property: "", errors: [I18nContext.current().t("panel.menu.noMoreSideGroupAllowed")] }]);
        }

        const items = [];
        for (const item of body.items) {
            const itemObj = JSON.parse(item);
            const { default: name, ...nameTranslations } = itemObj.name.values;

            const translation = {};
            for (const [lang, value] of Object.entries(nameTranslations)) {
                if (!translation[lang]) translation[lang] = {};
                if (value) translation[lang]["name"] = value;
            }
            items.push({ name: itemObj.name.values.default, price: itemObj.price || 0, translation: translation });
        }

        const translation = {};
        for (const lang in languages) {
            translation[lang] = {
                name: body[`name.${lang}`] || "",
                description: body[`description.${lang}`] || "",
            };
        }

        await this.MenuSideGroupModel.create({
            brand: brandID,
            name: body["name.default"] || "",
            description: body["description.default"] || "",
            maxNumberUserCanChoose: body.maximum || Infinity,
            items: items,
            createdAt: new Date(Date.now()),
            translation: translation,
        }).catch((e) => {
            console.log({ e });
            throw new InternalServerErrorException();
        });

        return res.end();
    }

    @Put("/:id")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    @UseInterceptors(FileInterceptor("uploadedFile"))
    async editRecord(@Param() params: IdDto, @Body() body: EditSideGroupDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"];

        const items = [];
        for (const item of body.items) {
            const itemObj = JSON.parse(item);
            const { default: name, ...nameTranslations } = itemObj.name.values;

            const translation = {};
            for (const [lang, value] of Object.entries(nameTranslations)) {
                if (!translation[lang]) translation[lang] = {};
                if (value) translation[lang]["name"] = value;
            }
            items.push({ name: itemObj.name.values.default, price: itemObj.price || 0, translation: translation });
        }

        const translation = {};
        for (const lang in languages) {
            translation[lang] = {
                name: body[`name.${lang}`] || "",
                description: body[`description.${lang}`] || "",
            };
        }

        await this.MenuSideGroupModel.updateOne(
            { _id: params.id },
            {
                name: body["name.default"] || "",
                description: body["description.default"] || "",
                maxNumberUserCanChoose: body.maximum || Infinity,
                items: items,
                translation: translation,
            },
        ).catch((e) => {
            throw new InternalServerErrorException();
        });

        return res.json({});
    }

    @Delete("/:id")
    @SetPermissions("main-panel.menu.items")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async deleteSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const group = await this.MenuSideGroupModel.findOne({ _id: params.id }).select("_id icon").exec();
        if (!group) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }

        // TODO : also delete group from all menu items that has it

        await this.MenuSideGroupModel.deleteOne({ _id: params.id }).exec();

        return res.end();
    }
}
