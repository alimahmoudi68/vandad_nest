import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator"


export class CreateTicketDto {

    @IsNotEmpty({message: "آیدی کاربر باید وارد شود"})

    @IsString({message: "عنوان باید رشته باشد"})
    @Length(2,50,{message : "عنوان باید بین ۲ و ۵۰ کاراکتر باشد"})
    title : string

    @IsString({message: "توضیحات باید رشته باشد"})
    @Length(2, 200,{message : "توضیحات باید بین ۲ و ۲۰۰ کاراکتر باشد"})
    description: string
    
    @IsNotEmpty({message : "آیدی کاربر نمی تواند خالی باشد"})
    @IsNumber({} , {message :"ایدی کاربر باید عدد باشد"})
    userId: number
    
    @IsOptional()
    @IsNumber({} , {message :"ایدی تیکت پدر باید عدد باشد"})
    parentId: number
}
