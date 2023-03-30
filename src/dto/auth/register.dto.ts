import { IsNotEmpty, Length, IsString, IsPhoneNumber } from "class-validator";

export class RegisterDto {
    @IsNotEmpty({ message: "ایمیل یا شماره همراه خود را وارد کنید" })
    readonly username: string;

    @Length(6, 6, { message: "کد نامعتبر" })
    @IsString({ message: "کد ارسال شده را وارد کنید" })
    @IsNotEmpty({ message: "کد ارسال شده را وارد کنید" })
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
