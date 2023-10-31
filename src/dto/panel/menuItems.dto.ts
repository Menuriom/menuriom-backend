import { IsNotEmpty, Length, IsString, IsJSON, IsArray, IsOptional, IsNumberString, IsMongoId, IsIn } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class MenuItemDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["name.default"]: string;

    @IsOptional()
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

    @IsOptional()
    @IsIn(["true", "false"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly discountActive: "true" | "false" = "false";

    @IsOptional()
    @IsNumberString({}, { message: i18nValidationMessage("validation.IsNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly discountPercentage: number = 0;

    // ====================================

    @IsOptional()
    @IsIn(["true", "false"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly specialDaysActive: "true" | "false" = "false";

    @IsOptional()
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsString({ message: i18nValidationMessage("validation.IsString"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty"), each: true })
    readonly specialDaysList: string[] = [];

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

    @IsOptional()
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsJSON({ message: i18nValidationMessage("validation.IsJSON"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty"), each: true })
    readonly variants: string[] = [];

    @IsOptional()
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty"), each: true })
    readonly sideItemList: string[];

    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly galleryList?: string | string[] = [];
}

export class UpdateOrderDto {
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly orderedGroup: Array<{ category: { _id: string; order: any }; items: Array<{ _id: string; order: any }> }>;
}
