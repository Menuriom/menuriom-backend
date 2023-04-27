import { Controller, Get, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { Request } from "src/interfaces/Request.interface";
import { AppService } from "./app.service";
import { languages } from "./interfaces/Translation.interface";

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
            Toman: "Toman - IRT",
            Rial: "Rial - IRR",
            Dollar: "Dollar - USD",
            Pound: "Pound - GBP",
            Euro: "Euro - EUR",
            Lira: "Lira - YTL",
            Dirham: "Dirham - AED",
        });
    }
}
