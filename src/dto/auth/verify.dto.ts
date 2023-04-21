import { IsNotEmpty, IsString, Length } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class VerifyDto {
    @IsNotEmpty({ message: i18nValidationMessage("validation.verify.username.IsNotEmpty") })
    readonly username: string;

    @Length(6, 6, { message: i18nValidationMessage("validation.verify.code.Length") })
    @IsString({ message: i18nValidationMessage("validation.verify.code.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.verify.code.IsNotEmpty") })
    readonly code: string;
}
