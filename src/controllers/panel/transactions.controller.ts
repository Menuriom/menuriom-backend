import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserDocument } from "src/models/Users.schema";
import { I18nContext } from "nestjs-i18n";
import { BillDocument } from "src/models/Bills.schema";
import { TransactionDocument } from "src/models/Transactions.schema";
import { IdDto } from "src/dto/general.dto";

@Controller("panel/transactions")
export class TransactionsController {
    constructor(
        // ...
        @InjectModel("User") private readonly UserModel: Model<UserDocument>,
        @InjectModel("Bill") private readonly BillModel: Model<BillDocument>,
        @InjectModel("Transaction") private readonly TransactionModel: Model<TransactionDocument>,
    ) {}

    @Get("/:id")
    async getSingleRecord(@Param() params: IdDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const transaction = await this.TransactionModel.findOne({ _id: params.id, user: req.session.userID }).exec();
        if (!transaction) {
            throw new UnprocessableEntityException([
                { property: "", errors: [I18nContext.current().t("panel.brand.no record was found, or you are not authorized to do this action")] },
            ]);
        }
        const bill = await this.BillModel.findOne({ _id: transaction.bill }).exec();

        return res.json({
            brandID: transaction.brand,
            bill: {
                billNumber: `#${bill.billNumber}`,
                description: bill.description,
                payablePrice: bill.payablePrice,
                status: bill.status,
                translation: bill.translation,
            },
            transaction: {
                code: transaction.code,
                method: transaction.method,
                paidPrice: transaction.paidPrice,
                status: transaction.status,
                createdAt: transaction.createdAt,
            },
        });
    }
}
