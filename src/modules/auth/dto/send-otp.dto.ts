import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone } from "class-validator";

export class SendOtpDto {
    @ApiProperty()
    @IsMobilePhone("fa-IR" , {} , {message : "مقدار وارد شده برای شماره تلفن معتبر نیست"})
    phone : string;
}
 