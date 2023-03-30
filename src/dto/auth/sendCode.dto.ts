import { IsNotEmpty } from "class-validator";

export class SendCodeDto {
    // TODO : set I18N for translating error messages
    @IsNotEmpty({ message: "ایمیل یا شماره همراه خود را وارد کنید" })
    readonly username: string;
}
