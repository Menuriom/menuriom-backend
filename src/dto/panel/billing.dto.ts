import { IsNotEmpty, Length, IsString, IsPhoneNumber, IsMongoId, IsArray, IsOptional, IsMobilePhone, IsIn } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class planChangeDto {
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsIn(["zarinpal"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly selectedGateway: string = "zarinpal";

    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsIn(["monthly", "yearly"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly selectedPaymentPeriod: "monthly" | "yearly";

    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly selectedPlan: string;
}

export class IDBrandDto {
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly id: string;
}
