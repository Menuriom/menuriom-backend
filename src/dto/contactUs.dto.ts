import { IsNotEmpty, IsString, IsIn, IsEmail, Length } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class ContactUsDto {
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly name: string;

    @IsEmail({}, { message: i18nValidationMessage("validation.IsEmail") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly email: string;

    @IsIn(["request-feature", "report-issue", "sales"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly subject: "request-feature" | "report-issue" | "sales";

    @Length(10, 1000, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly message: string;
}
