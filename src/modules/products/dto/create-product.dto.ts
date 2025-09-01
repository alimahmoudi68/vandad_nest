import { ApiAcceptedResponse, ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateProductDto {

    @IsString({message: "عنوان باید رشته باشد"})
    @Length(3 , 100 , {message : "عنوان محصول باید بین ۳ و ۱۰۰ کاراکتر باشد"})
    @ApiProperty({example: 'گوشی اپل'})
    title: string

    @IsNumber({},{message:"قیمت باید عدد باشد"})
    @IsNotEmpty()
    @ApiProperty({example: 100000})
    price: number

    @IsString({message : "توضیحات باید رشته باشد"})
    @IsOptional()
    @Length(5 , 600 , {message : "توضیحات باید بین ۵ و ۶۰۰ کاراکتر باشد"})
    @ApiProperty({example: 'بهترین گوشی موبایل'})
    description?: string

    @IsOptional()
    @IsString({message: "اسلاگ باید رشته باشد"})
    @ApiProperty({example: 'mobile-apple'})
    slug?: string;


    @IsOptional()
    @IsNumber({}, { message: "موجودی باید عدد باشد" })
    @ApiProperty({example: 10})
    stock?: number;

    @IsOptional()
    @IsString({message: "کد SKU باید رشته باشد"})
    @ApiProperty({example: 'simple-sku'})
    sku?: string;

    @IsOptional()
    @IsNumber({}, { message: "آیدی تصویر بندانگشتی باید عدد باشد" })
    @ApiProperty({example: 1})
    thumbnail?: number;

    @IsOptional()
    @ApiProperty({type: Number, isArray: true, example: []})
    images?: number[];

    @IsOptional()
    //@IsArray() // درخالت فرم میاد توی یک رشته میفرسته که با کاما جدا شده برای همین ارایه را کامنت کردم
    @ApiProperty({type: String , isArray: true, example: [1]})
    categories?: string[] | string


    @IsOptional()
    @ApiProperty({ type: Boolean, default: false })
    discount?: boolean;

    @IsOptional()
    @ApiProperty({ type: Number, default: 0 })
    discountPrice?: number;
}
