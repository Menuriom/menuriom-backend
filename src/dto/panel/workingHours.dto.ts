import { IsNotEmpty, Length, IsString, IsArray, IsOptional, IsMobilePhone, IsAlphanumeric, IsJSON } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class WorkingHoursDto {
    @IsJSON({ message: i18nValidationMessage("validation.IsAlphanumeric"), each: true })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty"), each: true })
    readonly workingHours: object;
}
