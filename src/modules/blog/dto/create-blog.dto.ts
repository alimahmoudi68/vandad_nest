import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, Length } from "class-validator";

export class CreateBlogDto {

    @ApiProperty({example: "عنوان مقاله"})
    @IsNotEmpty({message: "عنوان مقاله را وارد کنید"})
    @Length(3,50,{message : "عنوان مقاله باید بین ۳ و ۵۰ کاراکتر باشد"})
    title: string

    // @ApiProperty({format: "binary"})
    // image: string

    @ApiProperty({example: "متن مقاله"})
    @IsNotEmpty({message: "متن مقاله را وارد کنید"})
    @Length(3,2000,{message : "متن مقاله باید بین ۳ و ۲۰۰۰ کاراکتر باشد"})
    content: string

    @ApiPropertyOptional()
    @IsOptional()
    @Length(3,50,{message : "عنوان مقاله باید بین ۳ و ۵۰ کاراکتر باشد"})
    slug: string

    @ApiProperty()
    @IsNotEmpty({message: "زمان مطالعه مقاله را وارد کنید"})
    @Length(1, 2, { message: "زمان مطالعه باید بین ۱ و ۲ کاراکتر باشد" })
    timeStudy: string

    @ApiProperty({type : "integer" , isArray: true})
    @IsArray({message: "دسته بندی ها باید یک آرایه از عدد باشد"})
    categories: number[] 

}
