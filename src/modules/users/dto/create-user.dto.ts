import { IsMobilePhone, IsString, Length } from "class-validator";
import { Transform } from "class-transformer";

export class CreateUserDto {

    @IsString({message : "مقدار وارد شده برای نام کاربری معتبر نیست"})
    @Length(2, 20 , {message : "نام کاربری باید بین 2 تا 20 کاراکتر باشد"})
    firstName: string;

    @IsString({message : "مقدار وارد شده برای نام خانوادگی معتبر نیست"})
    @Length(3, 20 , {message : "نام خانوادگی باید بین 3 تا 20 کاراکتر باشد"})
    lastName: string;

    @Transform(({value})=>value.trim())    
    @IsMobilePhone("fa-IR" , {} , {message : "مقدار وارد شده برای شماره تلفن معتبر نیست"})
    phone: string;

    isAdmin: boolean;

}
