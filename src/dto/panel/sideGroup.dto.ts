import { IsNotEmpty, Length, IsString, IsJSON, IsArray, IsOptional, IsNumberString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateNewSideGroupDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["name.default"]: string;

    @Length(1, 300, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["description.default"]: string;

    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsJSON({ message: i18nValidationMessage("validation.IsJSON"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty"), each: true })
    readonly items: string[];

    @IsOptional()
    @IsNumberString({}, { message: i18nValidationMessage("validation.IsNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly maximum: number;
}

export class EditSideGroupDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["name.default"]: string;

    @Length(1, 300, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["description.default"]: string;

    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsJSON({ message: i18nValidationMessage("validation.IsJSON"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty"), each: true })
    readonly items: string[];

    @IsOptional()
    @IsNumberString({}, { message: i18nValidationMessage("validation.IsNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly maximum: number;
}
