import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNotEmpty, Length, IsNumber } from "class-validator";

export class CreateAddressDto {

    @ApiProperty()
    @IsString({message: "استان باید یک رشته باشد"})
    @IsNotEmpty({message: "استان نمی تواند خالی باشد"})
    province: string;

    @ApiProperty()
    @IsString({message: "شهر باید یک رشته باشد"})
    @IsNotEmpty({message: "شهر نمی تواند خالی باشد"})
    city: string;

    @ApiProperty()
    @IsString({message: "کد پستی باید یک رشته باشد"})
    @Length(10 , 10 , {message: "کد پستی باید ۱۰ رقم باشد"})
    postal_code: string;

    @ApiProperty()
    @IsString({message: "آدرس باید یک رشته باشد"})
    @IsNotEmpty({message: "آدرس نمی تواند خالی باشد"})
    address: string;

    @ApiProperty()
    @IsString({message: "شماره تلفن گیرنده باید یک رشته باشد"})
    @Length(11 , 11 , {message: "شماره تلفن باید ۱۱ رقم باشد"})
    receiver_phone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({message: "توضیحات باید یک رشته باشد"})
    description?: string;

    @ApiProperty()
    @IsNumber({} , {message : "نام کاربر باید عدد باشد"})
    @IsNotEmpty()
    userId: number;
}
