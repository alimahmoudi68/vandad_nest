import { Optional } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, Length } from "class-validator";

export class CreateTvDto {

    @ApiProperty({example: "عنوان ویدیو"})
    @IsNotEmpty({message: "عنوان ویدیو را وارد کنید"})
    @Length(3,50,{message : "عنوان ویدیو باید بین ۳ و ۵۰ کاراکتر باشد"})
    title: string

    @ApiProperty({example: "کلمات کلیدی ویدیو"})
    @Optional()
    keywords_meta: string

    @ApiProperty({example: "توضیحات متا"})
    @Optional()
    description_meta: string

    @ApiProperty({example: "18:23"})
    @IsNotEmpty({message: "رمان ویدیو را وارد کنید"})
    time: string

    @ApiProperty({example: ""})
    @IsNotEmpty({message: "لینک ویدیو را وارد کنید"})
    video_url: string

    @ApiProperty({example: "متن ویدیو"})
    @IsNotEmpty({message: "متن ویدیو را وارد کنید"})
    @Length(3,2000,{message : "متن ویدیو باید بین ۳ و ۲۰۰۰ کاراکتر باشد"})
    content: string

    @ApiPropertyOptional()
    @IsOptional()
    @Length(3,50,{message : "اسلاگ مقاله باید بین ۳ و ۵۰ کاراکتر باشد"})
    slug: string

    @ApiProperty({type : "integer" , isArray: true})
    @IsArray({message: "دسته بندی ها باید یک آرایه از عدد باشد"})
    categories: number[] 

    @IsOptional()
    @IsNumber({}, { message: "آیدی تصویر بندانگشتی باید عدد باشد" })
    @ApiProperty({example: 1})
    image?: number;
}
