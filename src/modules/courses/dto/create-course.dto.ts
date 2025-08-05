import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsNotEmpty, Length, IsArray } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({example: "عنوان دوره"})
  @IsNotEmpty({message: "عنوان دوره را وارد کنید"})
  @Length(3,50,{message : "عنوان دوره باید بین ۳ و ۵۰ کاراکتر باشد"})
  title: string

  @ApiProperty()
  @Length(3,50,{message : "اسلاگ دوره باید بین ۳ و ۵۰ کاراکتر باشد"})
  slug: string


  @ApiProperty({example: ""})
  @Optional()
  keywords_meta: string

  @ApiProperty({example: ""})
  @Optional()
  description_meta: string
 

  @ApiProperty({example: ""})
  @IsNotEmpty({message: "توضیحات دوره را وارد کنید"})
  @Length(3,2000,{message : "توضیحات دوره باید بین ۳ و ۲۰۰۰ کاراکتر باشد"})
  content: string

  @IsOptional()
  @IsNumber({}, { message: "آیدی تصویر بندانگشتی باید عدد باشد" })
  @ApiProperty({example: 1})
  image?: number;

  @ApiProperty({type : "integer" , isArray: true})
  @IsArray({message: "دسته بندی ها باید یک آرایه از عدد باشد"})
  categories: number[] 
}



