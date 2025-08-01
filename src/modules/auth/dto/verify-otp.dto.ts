import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsString, Length } from "class-validator";

export class VerifyOtpDto {
    @Length(1 , 30 , {message : "توکن نامعتبر است"})
    @ApiProperty()
    token : string;

    @IsString()
    @ApiProperty()
    @Length(5 , 5 , {message : "کد ارسالی باید 5 رقمی باشد"})
    otp : string;
}
