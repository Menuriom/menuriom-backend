import { IsNotEmpty, Length, IsString, IsJSON, IsArray, IsOptional, IsNumberString, IsMongoId, IsIn, IsBoolean, IsNumber } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class QRSaveDto {
    @Length(1, 150, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly link: string;

    @IsBoolean({ message: i18nValidationMessage("validation.IsBoolean") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly backgroundGradient: boolean = false;

    @IsIn(["Linear", "Radial"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly backgroundGradientType: "Linear" | "Radial" = "Linear";

    @IsIn([0, 45, 90], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly backgroundGradientAngle: 0 | 45 | 90 = 0;

    @Length(1, 20, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly backgroundColor1: string;

    @Length(1, 20, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly backgroundColor2: string;

    @IsBoolean({ message: i18nValidationMessage("validation.IsBoolean") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly foregroundGradient: boolean = false;

    @IsIn(["Linear", "Radial"], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly foregroundGradientType: "Linear" | "Radial" = "Linear";

    @IsIn([0, 45, 90], { message: i18nValidationMessage("validation.IsIn") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly foregroundGradientAngle: 0 | 45 | 90 = 0;

    @Length(1, 20, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly foregroundColor1: string;

    @Length(1, 20, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly foregroundColor2: string;

    @Length(1, 100, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly dotImage: string;

    @IsBoolean({ message: i18nValidationMessage("validation.IsBoolean") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly randomSize: boolean = false;

    @IsBoolean({ message: i18nValidationMessage("validation.IsBoolean") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly customCorner: boolean = false;

    @Length(1, 20, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly cornerRingColor: string;

    @Length(1, 20, { message: i18nValidationMessage("validation.Length") })
    @IsString({ message: i18nValidationMessage("validation.IsString") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly cornerCenterColor: string;

    @IsNumber({}, { message: i18nValidationMessage("validation.IsNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly cornerRingRadius: number = 0;

    @IsNumber({}, { message: i18nValidationMessage("validation.IsNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly cornerCenterRadius: number = 0;

    @IsBoolean({ message: i18nValidationMessage("validation.IsBoolean") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly withLogo: boolean = false;

    @IsNumber({}, { message: i18nValidationMessage("validation.IsNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly logoPadding: number = 0;

    @IsNumber({}, { message: i18nValidationMessage("validation.IsNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly logoBorderRadius: number = 0;

    @IsBoolean({ message: i18nValidationMessage("validation.IsBoolean") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly logoShadow: boolean = false;

    @IsNumber({}, { message: i18nValidationMessage("validation.IsNumber") })
    @IsNotEmpty({ message: i18nValidationMessage("validation.IsNotEmpty") })
    readonly logoShadowIntensity: number = 0;
}
