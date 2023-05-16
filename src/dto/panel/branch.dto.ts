import { IsNotEmpty, Length, IsString, IsPhoneNumber, IsMongoId, IsArray, IsOptional, Matches, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateNewBranchDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["name.default"]: string;

    @Length(1, 300, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["address.default"]: string;

    @IsOptional()
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsPhoneNumber("IR", { message: i18nValidationMessage("validation.IsPhoneNumber"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty"), each: true })
    readonly telephoneNumbers: string[];

    @IsOptional()
    @Length(10, 10, { message: i18nValidationMessage("validation.Length") })
    @Matches(/\b(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}\b/gm, { message: i18nValidationMessage("validation.IsPostalCode") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    readonly postalCode: string;
}

export class EditBranchDto {
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly galleryList: string | string[] = [];

    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["name.default"]: string;

    @Length(1, 300, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly ["address.default"]: string;

    @IsOptional()
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsPhoneNumber("IR", { message: i18nValidationMessage("validation.IsPhoneNumber"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty"), each: true })
    readonly telephoneNumbers: string[] = [];

    @IsOptional()
    @Length(10, 10, { message: i18nValidationMessage("validation.Length") })
    @Matches(/\b(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}\b/gm, { message: i18nValidationMessage("validation.IsPostalCode") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    readonly postalCode: string;
}

export class IDBrandDto {
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly brandID: string;
}

export class IDBranchDto {
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly id: string;
}

// ========================================
