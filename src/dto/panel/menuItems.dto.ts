import { IsNotEmpty, Length, IsString, IsJSON, IsArray, IsOptional, IsNumberString, IsMongoId, IsIn } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateNewItemDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["name.default"]: string;

    @Length(1, 300, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["description.default"]: string;

    @IsNumberString({}, { message: i18nValidationMessage("validation.IsNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly price: number;

    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly selectedCategory: string;

    @IsOptional()
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly branches: string[] = [];

    // ====================================

    @IsIn(["true", "false"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly discountActive: "true" | "false" = "false";

    @IsNumberString({}, { message: i18nValidationMessage("validation.IsNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly discountPercentage: number;

    // ====================================

    @IsIn(["true", "false"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly specialDaysActive: "true" | "false" = "false";

    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsString({ message: i18nValidationMessage("validation.IsString"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty"), each: true })
    readonly specialDaysList: string[];

    // ====================================

    @IsIn(["true", "false"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly hidden: "true" | "false" = "false";

    @IsOptional()
    @IsIn(["true", "false"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly pinned: "true" | "false" = "false";

    @IsIn(["true", "false"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly soldOut: "true" | "false" = "false";

    @IsOptional()
    @IsIn(["true", "false"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly showAsNew: "true" | "false" = "false";

    // ====================================

    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsJSON({ message: i18nValidationMessage("validation.IsJSON"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty"), each: true })
    readonly variants: string[];
}

export class EditItemDto {
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

    @IsNumberString({}, { message: i18nValidationMessage("validation.IsNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly price: number;

    @IsOptional()
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly branches: string[] = [];
}
