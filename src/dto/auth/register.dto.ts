import { IsNotEmpty, Length, IsString, IsMobilePhone } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class RegisterDto {
    @IsNotEmpty({ message: i18nValidationMessage("validation.register.username.IsNotEmpty") })
    readonly username: string;

    @Length(6, 6, { message: i18nValidationMessage("validation.register.code.Length") })
    @IsString({ message: i18nValidationMessage("validation.register.code.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.register.code.IsNotEmpty") })
    readonly code: string;

    @Length(1, 100, { message: i18nValidationMessage("validation.register.name.Length") })
    @IsString({ message: i18nValidationMessage("validation.register.name.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.register.name.IsNotEmpty") })
    readonly name: string;

    @Length(1, 100, { message: i18nValidationMessage("validation.register.family.Length") })
    @IsString({ message: i18nValidationMessage("validation.register.family.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.register.family.IsNotEmpty") })
    readonly family: string;

    @IsMobilePhone("fa-IR", { strictMode: true }, { message: i18nValidationMessage("validation.register.mobile.IsPhoneNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.register.mobile.IsNotEmpty") })
    readonly mobile: string;
}
