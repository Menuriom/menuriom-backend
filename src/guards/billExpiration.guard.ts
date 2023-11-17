import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpException, HttpStatus } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BillDocument } from "src/models/Bills.schema";
import { BrandDocument } from "src/models/Brands.schema";
import { BrandsPlanDocument } from "src/models/BrandsPlans.schema";
import { I18nContext } from "nestjs-i18n";

@Injectable()
export class CheckUnpaidInvoiceInSelectedBrand implements CanActivate {
    constructor(
        private reflector: Reflector,
        // @InjectModel("Brand") private readonly BrandModel: Model<BrandDocument>,
        @InjectModel("BrandsPlan") private readonly BrandsPlanModel: Model<BrandsPlanDocument>,
        @InjectModel("Bill") private readonly BillModel: Model<BillDocument>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const brandID = request.headers["brand"] || "";

        try {
            const brandCurrentPlan = await this.BrandsPlanModel.findOne({ brand: brandID }).exec();
            if (!brandCurrentPlan) throw new ForbiddenException();

            if (brandCurrentPlan.nextInvoice && brandCurrentPlan.nextInvoice < new Date(Date.now())) {
                const unpaidBill = await this.BillModel.exists({ brand: brandID, type: "renewal", status: { $in: ["notPaid", "pendingPayment"] } }).exec();
                if (unpaidBill) {
                    throw new HttpException([{ property: "", errors: [I18nContext.current().t("panel.billing.payUpMessage")] }], HttpStatus.PAYMENT_REQUIRED);
                }
            }

            return true;
        } catch (e) {
            throw new ForbiddenException();
        }

        throw new ForbiddenException();
    }
}
