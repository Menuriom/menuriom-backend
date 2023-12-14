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
        const lang = "en";
        const emailTemplate = "newBillEmail";
        const vals: { k: string; v: string }[] = [
            { k: "code", v: "623123" },
            { k: "url", v: "http://localhost:3000" },

            // usernameChange -> data.newUsername
            { k: "brandUsername", v: "@dasdasda" },

            // newInvite -> data.brandName data.roleName
            { k: "brandName", v: "dasda" },
            { k: "roleName", v: "dasda" },

            // inviteUpdate -> data.userEmail data.status(accepted-rejected)
            { k: "userEmail", v: "kasrakeshvardoost@gmail.com" },
            { k: "backgroundColor", v: "#bbf7d0" }, // #bbf7d0 | #fecaca
            { k: "color", v: "#15803d" }, // #15803d | #b91c1c
            { k: "status", v: "تایید شد" },
            { k: "img", v: "img6.png" }, // img6.png | img5.png

            // newBill -> data.userEmail data.status(accepted-rejected)
            { k: "type", v: "Renewal" },
            { k: "description", v: "subscribtion renwal for your menuriom plan" },
            { k: "billNumber", v: "#42342" },
            { k: "issueDate", v: "1399/09/01 13:58" },
            { k: "payablePrice", v: "135,000 Toman" },
            { k: "planIcon", v: "standard-g.png" },
            { k: "planName", v: "Standard plan" },
            { k: "planPeriod", v: "yearly" },
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
