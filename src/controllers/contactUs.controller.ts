import { Body, Controller, Get, InternalServerErrorException, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContactUsDocument } from "src/models/ContactUs.schema";
import { ContactUsDto } from "src/dto/contactUs.dto";
import Email from "src/notifications/channels/Email";

@Controller("contact-us")
export class ContactUsController {
    constructor(
        // ...
        @InjectModel("ContactUs") private readonly ContactUsModel: Model<ContactUsDocument>,
    ) {}

    @Post("/send")
    async getPurchasablePlans(@Body() body: ContactUsDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        await this.ContactUsModel.create({
            email: body.email,
            name: body.name,
            subject: body.subject,
            message: body.message,
            createdAt: new Date(Date.now()),
        }).catch((e) => {
            console.log({ e });
            throw InternalServerErrorException;
        });

        await Email(`New Contact Message | Menuriom`, process.env.MY_EMAIL, body.message)
            .then(() => {})
            .catch((e) => console.log(e));

        return res.end();
    }
}
