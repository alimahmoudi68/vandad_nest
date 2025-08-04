import { Optional } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, Length } from "class-validator";

export class CreateBlogDto {

    @ApiProperty({example: "عنوان مقاله"})
    @IsNotEmpty({message: "عنوان مقاله را وارد کنید"})
    @Length(3,50,{message : "عنوان مقاله باید بین ۳ و ۵۰ کاراکتر باشد"})
    title: string

    @ApiProperty({example: ""})
    @Optional()
    keywords_meta: string

    @ApiProperty({example: "عنوان مقاله"})
    @Optional()
    description_meta: string

    @ApiProperty({example: "متن مقاله"})
    @IsNotEmpty({message: "متن مقاله را وارد کنید"})
    @Length(3,2000,{message : "متن مقاله باید بین ۳ و ۲۰۰۰ کاراکتر باشد"})
    content: string

    @ApiPropertyOptional()
    @IsOptional()
    @Length(3,50,{message : "عنوان مقاله باید بین ۳ و ۵۰ کاراکتر باشد"})
    slug: string

    @ApiProperty({type : "integer" , isArray: true})
    @IsArray({message: "دسته بندی ها باید یک آرایه از عدد باشد"})
    categories: number[] 

    @IsOptional()
    @IsNumber({}, { message: "آیدی تصویر بندانگشتی باید عدد باشد" })
    @ApiProperty({example: 1})
    image?: number;

}
