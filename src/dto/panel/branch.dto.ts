import { IsNotEmpty, Length, IsString, IsPhoneNumber, IsMongoId, IsArray } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateNewBrandDto {}

export class EditBrandDto {}

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
    readonly branchID: string;
}
