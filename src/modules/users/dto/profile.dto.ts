import { IsInt, IsString, Length } from "class-validator";
import { Transform } from "class-transformer";

export class ProfileDto {
    @Transform(({value})=>value.trim())    
    @IsString({message : "مقدار وارد شده برای شماره تلفن معتبر نیست"})
    @Length(2,20 , {message : "آیدی اینستاگرام باید بین ۲و ۲۰ کاراکتر باشد"})
    instagram?: string;


    @IsInt({message : "آیدی کاربر باید عدد باشد"})
    userId: number;
}