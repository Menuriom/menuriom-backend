import { IsNotEmpty, Length, IsString, IsPhoneNumber } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class RegisterDto {
    @IsNotEmpty({ message: i18nValidationMessage("dto.please enter your mobile or email") })
    readonly username: string;

    @Length(6, 6, { message: i18nValidationMessage("dto.invalid code") })
    @IsString({ message: i18nValidationMessage("dto.enter the sent code") })
    @IsNotEmpty({ message: i18nValidationMessage("dto.enter the sent code") })
    readonly code: string;

    @Length(1, 100, { message: "نام حداکثر 100 کاراکتر" })
    @IsString({ message: "نام خود را وارد کنید" })
    @IsNotEmpty({ message: "نام خود را وارد کنید" })
    readonly name: string;

    @Length(1, 100, { message: "نام خانوادگی حداکثر 100 کاراکتر" })
    @IsString({ message: "نام خانوادگی خود را وارد کنید" })
    @IsNotEmpty({ message: "نام خانوادگی خود را وارد کنید" })
    readonly family: string;

    @IsPhoneNumber("IR", { message: "شماره همراه خود را وارد کنید" })
    @IsNotEmpty({ message: "رمزعبور برای حساب خود انتخاب کنید" })
    readonly mobile: string;

    @IsNotEmpty({ message: "رمزعبورها باهم همخوانی ندارند" })
    readonly size: number;
}
