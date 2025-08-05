import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Length } from "class-validator";

export class CreateCourseCatDto {
    @ApiProperty({example: "عنوان دسته بندی"})
    @IsNotEmpty({message: "عنوان دسته بندی را وارد کنید"})
    @Length(3,50,{message : "عنوان دسته بندی باید بین ۳ و ۵۰ کاراکتر باشد"})
    title: string

    @ApiProperty({example: ""})
    @IsNotEmpty({message: "اسلاگ دسته بندی را وارد کنید"})
    @Length(3,50,{message : "اسلاگ دسته بندی باید بین ۳ و ۵۰ کاراکتر باشد"})
    slug: string
}

