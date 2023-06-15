import { Body, Param, Query, Controller, Delete, Get, UseGuards, Post, Put, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NotFoundException, UnprocessableEntityException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { Response, query } from "express";
import { Request } from "src/interfaces/Request.interface";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { UserDocument } from "src/models/Users.schema";
import { I18nContext } from "nestjs-i18n";
import { BillDocument } from "src/models/Bills.schema";
import { TransactionDocument } from "src/models/Transactions.schema";
import { IdDto } from "src/dto/general.dto";
import { SetPermissions } from "src/decorators/authorization.decorator";
import { AuthorizeUserInSelectedBrand } from "src/guards/authorizeUser.guard";
import { ListingDto } from "src/dto/panel/billing.dto";

@Controller("panel/icons")
export class IconsController {
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

    @Get("/")
    @SetPermissions("main-panel.billing.access")
    @UseGuards(AuthorizeUserInSelectedBrand)
    async getTransactionList(@Query() query: ListingDto, @Req() req: Request, @Res() res: Response): Promise<void | Response> {
        const brandID = req.headers["brand"].toString();

        // sort
        let sort: any = { _id: -1 };

        // the base query object
        let matchQuery: FilterQuery<any> = { brand: new Types.ObjectId(brandID) };
        if (query.lastRecordID) matchQuery = { _id: { $lt: new Types.ObjectId(query.lastRecordID) }, ...matchQuery };
        if (req.query.billID) matchQuery["bill"] = new Types.ObjectId(req.query.billID.toString());

        // making the model with query
        let data = this.TransactionModel.aggregate();
        data.sort(sort);
        data.match(matchQuery);
        data.lookup({ from: "users", localField: "user", foreignField: "_id", as: "user" });
        data.project({ _id: 1, code: 1, method: 1, paidPrice: 1, status: 1, createdAt: 1, "user.avatar": 1, "user.name": 1, "user.family": 1 });
        data.limit(Number(query.pp));

        // executing query and getting the results
        let error;
        const exec: any[] = await data.exec().catch((e) => (error = e));
        if (error) throw new InternalServerErrorException();
        const transactions: any[] = exec.map((record) => {
            return {
                _id: record._id,
                code: record.code,
                method: record.method,
                paidPrice: record.paidPrice,
                status: record.status,
                createdAt: record.createdAt,
                user: record.user[0],
            };
        });

        return res.json({ records: transactions });
    }
}
