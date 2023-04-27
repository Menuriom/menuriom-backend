import { IsNotEmpty, Length, IsString, IsPhoneNumber, IsMobilePhone, IsNumber, IsOptional } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class SetupBrandDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly name: string;

    @IsOptional()
    @Length(1, 150, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly slogan?: string;

    @Length(1, 20, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly branchSize: number;

    @Length(1, 250, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly address: string;

    @IsPhoneNumber("IR", { message: i18nValidationMessage("validation.IsPhoneNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly tel: string;
}
