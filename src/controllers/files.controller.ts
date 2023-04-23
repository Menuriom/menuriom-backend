import * as fs from "fs/promises";
import { Body, Controller, Get, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";

@Controller("file")
export class FilesController {
    constructor() {}

    @Get("/*")
    async getFile(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        let filepath = `storage/public${req.url.replace("/file", "")}`;
        filepath = filepath.split("../").join("");

        // const filepathArray = filepath.split("/");

        const isFileExists = await fs
            .access(filepath)
            .then(() => true)
            .catch(() => false);
        if (!isFileExists) return res.status(404).end();
        return res.sendFile(`${process.cwd()}/${filepath}`);

        // return res.status(404).end();
    }
}
