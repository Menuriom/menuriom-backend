import { IsNotEmpty, IsString, IsMongoId, IsArray, IsOptional } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class NewRoleDto {
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly roleName?: string;

    @IsArray({ message: i18nValidationMessage("validation.IsArray") })
    @IsString({ message: i18nValidationMessage("validation.IsMongoId"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly permissions: string[] = [];
}

export class IdDto {
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly id: string;
}
