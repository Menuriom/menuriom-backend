import { IsNotEmpty } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class SendCodeDto {
    @IsNotEmpty({ message: i18nValidationMessage("validation.sendCode.username.IsNotEmpty") })
    readonly username: string;
}
