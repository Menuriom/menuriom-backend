import { IsNotEmpty, Length, IsString, IsMobilePhone, IsEmail } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CompleteInfoDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.user.name.Length") })
    @IsString({ message: i18nValidationMessage("validation.user.name.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.user.name.IsNotEmpty") })
    readonly name: string;

    @Length(1, 100, { message: i18nValidationMessage("validation.user.family.Length") })
    @IsString({ message: i18nValidationMessage("validation.user.family.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.user.family.IsNotEmpty") })
    readonly family: string;

    @IsMobilePhone("fa-IR", { strictMode: true }, { message: i18nValidationMessage("validation.user.mobile.IsPhoneNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.user.mobile.IsNotEmpty") })
    readonly mobile: string;
}

export class EditUserInfoDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.user.name.Length") })
    @IsString({ message: i18nValidationMessage("validation.user.name.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.user.name.IsNotEmpty") })
    readonly name: string;

    @Length(1, 100, { message: i18nValidationMessage("validation.user.family.Length") })
    @IsString({ message: i18nValidationMessage("validation.user.family.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.user.family.IsNotEmpty") })
    readonly family: string;
}

export class SendEmailVerificationDto {
    @IsEmail({}, { message: i18nValidationMessage("validation.IsEmail") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.sendCode.username.IsNotEmpty") })
    readonly email: string;
}

export class SendMobilelVerificationDto {
    @IsMobilePhone("fa-IR", { strictMode: true }, { message: i18nValidationMessage("validation.user.mobile.IsPhoneNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.sendCode.username.IsNotEmpty") })
    readonly mobile: string;
}

export class VerifyCodeDto {
    @Length(6, 6, { message: i18nValidationMessage("validation.verify.code.Length") })
    @IsString({ message: i18nValidationMessage("validation.verify.code.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.verify.code.IsNotEmpty") })
    readonly code: string;
}
