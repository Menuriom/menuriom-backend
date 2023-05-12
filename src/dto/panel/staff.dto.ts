import { IsNotEmpty, Length, IsString, IsPhoneNumber, IsMongoId, IsArray, IsOptional, IsMobilePhone, IsEmail } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class SendInviteDTO {
    @IsEmail({}, { message: i18nValidationMessage("validation.IsEmail") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly email: string;

    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly selectedRole: string;

    @IsArray({ message: i18nValidationMessage("validation.IsString") })
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly selectedBranches: string[];
}

export class IdDto {
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly id: string;
}
