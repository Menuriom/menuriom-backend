import { IsNotEmpty, Length, IsString, IsArray, IsOptional, IsMobilePhone, IsAlphanumeric, Matches } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class EditBrandDto {
    @Length(1, 50, { message: i18nValidationMessage("validation.Length") })
    // @IsAlphanumeric("en-US", { message: i18nValidationMessage("validation.IsAlphanumeric") })
    @Matches(new RegExp("^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:.(?!.))){0,28}(?:[A-Za-z0-9_]))?)$"), { message: i18nValidationMessage("validation.IsUsername") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly username: string;

    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["name.default"]: string;

    @IsOptional()
    @Length(1, 150, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["slogan.default"]?: string;

    @IsOptional()
    @Length(1, 150, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly socials_instagram?: string;

    @IsOptional()
    @Length(1, 150, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly socials_twitter?: string;

    @IsOptional()
    @Length(1, 150, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly socials_telegram?: string;

    @IsOptional()
    @Length(1, 150, { message: i18nValidationMessage("validation.Length") })
    @IsMobilePhone("fa-IR", {}, { message: i18nValidationMessage("validation.IsMobilePhone") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly socials_whatsapp?: string;
}

export class SaveBrandSettingsDto {
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly languages: string[];

    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly currency: string;
}
