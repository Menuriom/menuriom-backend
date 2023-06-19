import { IsNotEmpty, Length, IsString, IsPhoneNumber, IsMongoId, IsArray, IsOptional, Matches, ValidateNested, IsIn } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateNewCategoryDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["name.default"]: string;

    @IsIn(["upload", "list"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly iconMode: "upload" | "list";

    @IsOptional()
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly selectedIcon: string;

    @IsIn(["true", "false"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly showAsNew: "true" | "false";

    @IsIn(["true", "false"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly hide: "true" | "false";

    @IsOptional()
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly branches: string[] = [];
}

export class EditCategoryDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["name.default"]: string;

    @IsIn(["upload", "list"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly iconMode: "upload" | "list";

    @IsOptional()
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly selectedIcon: string;

    @IsIn(["true", "false"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly showAsNew: "true" | "false";

    @IsIn(["true", "false"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly hide: "true" | "false";

    @IsOptional()
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly branches: string[] = [];
}

export class updateOrderDto {
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly orderedCategories: Array<{ _id: string; order: any }>;
}
