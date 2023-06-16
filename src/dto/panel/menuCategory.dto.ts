import { IsNotEmpty, Length, IsString, IsPhoneNumber, IsMongoId, IsArray, IsOptional, Matches, ValidateNested, IsIn } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateNewCategoryDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["name.default"]: string;

    @IsIn(["upload", "list"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly iconMode: string;

    @IsOptional()
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly selectedIcon: string;
}

export class EditCategoryDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["name.default"]: string;

    @IsIn(["upload", "list"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly iconMode: string;

    @IsOptional()
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly selectedIcon: string;
}
