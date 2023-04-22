import { Body, Controller, Delete, Get, InternalServerErrorException, Post, Put, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { BrandDocument } from "src/models/Brands.schema";
import { FileService } from "src/services/file.service";
import { unlink } from "fs/promises";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateNewBrandDto, EditBrandDto } from "src/dto/userPanel/brand.dto";
import { I18nContext } from "nestjs-i18n";

@Controller("brand")
export class BrandController {
    constructor(
        // ...
        private readonly fileService: FileService,
        @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
    ) {}

    @Get("/")
    async getList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {}

    @Get("/:id")
    async getSingleRecord(@Req() req: Request, @Res() res: Response): Promise<void | Response> {}

    @Post("/")
    @UseInterceptors(FileInterceptor("logo"))
    async addRecord(
        @UploadedFile() logo: Express.Multer.File,
        @Body() input: CreateNewBrandDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void | Response> {}

    @Put("/:id")
    @UseInterceptors(FileInterceptor("logo"))
    async editRecord(@UploadedFile() logo: Express.Multer.File, @Body() input: EditBrandDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {}

    @Delete("/:id")
    async deleteSingleRecord(@Req() req: Request, @Res() res: Response): Promise<void | Response> {}
}
