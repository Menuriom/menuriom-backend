import { IsNotEmpty, Length, IsString, IsPhoneNumber, IsAlphanumeric, IsOptional, IsArray, IsMongoId } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class invitationListDto {
    @IsOptional()
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly lastRecordID?: string;

    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly pp: string = "25";
}

export class acceptInvitesDto {
    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly invites: string[];
}

export class SetupBrandDto {
    @Length(1, 50, { message: i18nValidationMessage("validation.Length") })
    @IsAlphanumeric("en-US", { message: i18nValidationMessage("validation.IsAlphanumeric") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly username: string;

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
