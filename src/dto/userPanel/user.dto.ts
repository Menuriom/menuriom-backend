import { IsNotEmpty, Length, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

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
