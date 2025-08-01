import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, Length, IsOptional, IsNumber, IsArray, IsInt, IsPositive } from "class-validator";

export class CreateCategoryDto {
    @IsString({message: "عنوان باید رشته باشد"})
    @ApiProperty({example: 'کتاب'})
    @Length(3 , 30 , {message : "عنوان محصول باید بین ۳ و ۳۰ کاراکتر باشد"})
    title: string

    @IsString({message: "اسلاگ باید رشته باشد"})
    @ApiProperty({example: 'ketab', description: 'نامک یکتا برای دسته‌بندی'})
    @Length(3, 30, {message: "اسلاگ باید بین ۳ و ۳۰ کاراکتر باشد"})
    slug: string;

    @IsOptional()
    @IsString({message: "توضیحات باید رشته باشد"})
    @ApiPropertyOptional({example: 'دسته‌بندی کتاب‌ها', description: 'توضیحات دسته‌بندی'})
    description?: string;

    @IsOptional()
    @IsNumber({}, {message: "شناسه والد باید عدد باشد"})
    @ApiPropertyOptional({example: 1, description: 'شناسه دسته والد'})
    parent?: number;

    @IsOptional()
    @IsArray({message: "ویژگی‌ها باید آرایه‌ای از اعداد باشند"})
    @IsInt({each: true, message: "هر ویژگی باید عدد صحیح باشد"})
    @IsPositive({each: true, message: "هر ویژگی باید عدد مثبت باشد"})
    @ApiPropertyOptional({type: [Number], example: [1,2], description: 'آیدی ویژگی‌ها'})
    attributes?: number[];
}



