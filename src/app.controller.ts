import { Controller, Get, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { AppService } from "./app.service";
import { languages } from "./interfaces/Translation.interface";
import { readFile } from "fs/promises";

@Controller("general")
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get("/language-list")
    async getLanguageList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        return res.json({ ...languages });
    }

    @Get("/currency-list")
    async getCurrencyList(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        return res.json({
            // Toman: "Toman - IRT", // تومان
            // Rial: "Rial - IRR", // ﷼
            // Dollar: "Dollar - USD", // $
            // Pound: "Pound - GBP", // £
            // Euro: "Euro - EUR", // €
            // Lira: "Lira - YTL", // ₺
            // Dirham: "Dirham - AED", // د.إ

            تومان: "Toman - IRT", // تومان
            "﷼": "Rial - IRR", // ﷼
            $: "Dollar - USD", // $
            "£": "Pound - GBP", // £
            "€": "Euro - EUR", // €
            "₺": "Lira - YTL", // ₺
            "د.إ": "Dirham - AED", //
        });
    }

    @Get("/templ")
    async viewTempl(@Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const lang = "fa";
        const emailTemplate = "newInviteEmail";
        const vals: { k: string; v: string }[] = [
            { k: "code", v: "623123" },
            { k: "url", v: "http://localhost:3000" },

            // usernameChange -> data.newUsername
            { k: "brandUsername", v: "@dasdasda" },

            // newInvite -> data.brandName data.roleName
            { k: "brandName", v: "dasda" },
            { k: "roleName", v: "dasda" },
        ];

        let html: string = await readFile(`./src/notifications/templates/${lang}/${emailTemplate}.html`).then((buffer) => buffer.toString());
        vals.forEach((val) => {
            html = html.replace(new RegExp(`{{${val.k}}}`, "g"), val.v);
        });

        res.type("html");
        res.write(html);
        return res.end();
    }
}
