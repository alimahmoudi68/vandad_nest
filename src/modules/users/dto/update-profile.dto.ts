import { IsNumber, IsOptional, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProfileDto {

    @IsString({message : "مقدار وارد شده برای نام کاربری معتبر نیست"})
    @Length(2, 20 , {message : "نام کاربری باید بین 2 تا 20 کاراکتر باشد"})
    firstName: string;

    @IsString({message : "مقدار وارد شده برای نام خانوادگی معتبر نیست"})
    @Length(3, 20 , {message : "نام خانوادگی باید بین 3 تا 20 کاراکتر باشد"})
    lastName: string;


    @IsString({message : "مقدار وارد شده برای درباره من معتبر نیست"})
    @Length(2, 100 , {message : "محتوای درباره من باید بین 2 تا 100 کاراکتر باشد"})
    about: string;

    
    @IsOptional()
    @IsNumber({}, { message: "آیدی تصویر بندانگشتی باید عدد باشد" })
    @ApiProperty({example: 1})
    avatar?: number;

}
