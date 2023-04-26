import { IsNotEmpty, Length, IsString, IsPhoneNumber, IsMongoId } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateNewBrandDto {
    // @Length(1, 100, { message: i18nValidationMessage("validation.user.name.Length") })
    // @IsString({ message: i18nValidationMessage("validation.user.name.IsString") })
    // @IsNotEmpty({ message: i18nValidationMessage("validation.user.name.IsNotEmpty") })
    // readonly name: string;

    // @Length(1, 100, { message: i18nValidationMessage("validation.user.family.Length") })
    // @IsString({ message: i18nValidationMessage("validation.user.family.IsString") })
    // @IsNotEmpty({ message: i18nValidationMessage("validation.user.family.IsNotEmpty") })
    // readonly family: string;

    // @IsPhoneNumber("IR", { message: i18nValidationMessage("validation.user.mobile.IsPhoneNumber") })
    // @IsNotEmpty({ message: i18nValidationMessage("validation.user.mobile.IsNotEmpty") })
    // readonly mobile: string;
}

export class EditBrandDto {
    @Length(1, 100, { message: i18nValidationMessage("validation.user.name.Length") })
    @IsString({ message: i18nValidationMessage("validation.user.name.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.user.name.IsNotEmpty") })
    readonly name: string;

    @Length(1, 100, { message: i18nValidationMessage("validation.user.family.Length") })
    @IsString({ message: i18nValidationMessage("validation.user.family.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.user.family.IsNotEmpty") })
    readonly family: string;
}

export class DeleteBrandDto {
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly id: string;
}
