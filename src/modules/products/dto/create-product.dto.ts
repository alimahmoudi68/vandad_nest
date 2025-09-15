import { ApiAcceptedResponse, ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateIf } from "class-validator";

export class CreateProductDto {

    @IsString({message: "عنوان باید رشته باشد"})
    @Length(3 , 100 , {message : "عنوان محصول باید بین ۳ و ۱۰۰ کاراکتر باشد"})
    @ApiProperty({example: 'گوشی اپل'})
    title: string

    @IsOptional() 
    @IsString({message: "اسلاگ باید رشته باشد"}) 
    @ApiProperty({example: 'mobile-apple'}) 
    slug?: string;

    @ValidateIf(o => !o.variants || o.variants.length === 0)
    @IsNumber({},{message:"قیمت باید عدد باشد"})
    @IsNotEmpty({message: "قیمت محصول الزامی است"})
    @ApiProperty({example: 100000, description: 'قیمت محصول. اگر isVariant=true باشد، این فیلد اختیاری است و قیمت بر اساس کمترین قیمت واریانت محاسبه می‌شود'})
    price?: number

    @IsString({message : "توضیحات باید رشته باشد"})
    @IsOptional()
    @Length(5 , 600 , {message : "توضیحات باید بین ۵ و ۶۰۰ کاراکتر باشد"})
    @ApiProperty({example: 'بهترین گوشی موبایل'})
    description: string

    @ValidateIf(o => !o.variants || o.variants.length === 0)
    @IsNumber({}, {message: "موجودی باید عدد باشد"})
    @ApiProperty({example: 10})
    stock?: number;

    @ValidateIf(o => !o.variants || o.variants.length === 0)
    @IsString({message: "کد SKU باید رشته باشد"})
    @IsNotEmpty({message: "کد SKU محصول الزامی است"})
    @ApiProperty({example: 'simple-sku', description: 'کد SKU محصول. اگر isVariant=true باشد، این فیلد اختیاری است و SKU در هر واریانت تعریف می‌شود'})
    sku?: string;

    @IsOptional()
    @IsNumber({}, { message: "آیدی تصویر بندانگشتی باید عدد باشد" })
    @ApiProperty({example: 1})
    thumbnail?: number;

    @IsOptional()
    @ApiProperty({type: Number, isArray: true, example: []})
    images?: number[];

    //@IsArray() // درخالت فرم میاد توی یک رشته میفرسته که با کاما جدا شده برای همین ارایه را کامنت کردم
    @ApiProperty({type: String , isArray: true, example: [1]})
    categories: number 

    @IsOptional()
    @ApiProperty({ type: Boolean, default: false, example: false })
    isVariant?: boolean;

    @IsOptional()
    @ApiProperty({ type: Object, description: 'ویژگی‌های محصول به صورت map از slug به مقدار یا آیدی', example: { color: 1 } })
    attributes?: { [key: string]: string };

    @IsOptional()
    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                attributes: { type: 'object', additionalProperties: { type: 'string' } },
                price: { type: 'number' },
                stock: { type: 'number' },
                sku: { type: 'string' },
                discount: { type: 'boolean' },
                discountPrice: { type: 'number' },
                images: { type: 'array', items: { type: 'number' } }
            }
        },
        description: 'لیست واریانت‌های محصول',
        example: [
            {
                attributes: { color: '6822e5cf437c593be04b2ddc' },
                price: 120000,
                stock: 5,
                sku: 'variant-sku-1',
                discount: true,
                discountPrice: 100000,
                images: [1, 2, 3]
            },
            {
                attributes: { color: '6822e5d7437c593be04b2de5' },
                price: 100000,
                stock: 5,
                sku: 'variant-sku-2',
                discount: false,
                discountPrice: 0,
                images: [4, 5]
            }
        ]
    })
    variants?: Array<{
        attributes: { [key: string]: string },
        price: number,
        stock: number,
        sku: string,
        discount?: boolean,
        discountPrice?: number,
        images?: number[]
    }>;

    @IsOptional()
    @ApiProperty({ type: Boolean, default: false })
    discount?: boolean;

    @IsOptional()
    @ApiProperty({ type: Number, default: 0 })
    discountPrice?: number;
}
