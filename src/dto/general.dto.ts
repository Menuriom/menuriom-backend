import { IsNotEmpty, IsString, IsMongoId } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class IdDto {
    @IsMongoId({ message: i18nValidationMessage("validation.IsMongoId") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly id: string;
}
