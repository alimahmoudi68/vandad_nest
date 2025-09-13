import { ApiAcceptedResponse, ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateProductDto {

    @IsString({message: "عنوان باید رشته باشد"})
    @Length(3 , 100 , {message : "عنوان محصول باید بین ۳ و ۱۰۰ کاراکتر باشد"})
    @ApiProperty({example: 'گوشی اپل'})
    title: string

    @IsNumber({},{message:"قیمت باید عدد باشد"})
    @IsNotEmpty()
    @ApiProperty({example: 100000, description: 'قیمت محصول. اگر isVariant=true باشد، این قیمت بر اساس کمترین قیمت واریانت محاسبه می‌شود'})
    price: number

    @IsString({message : "توضیحات باید رشته باشد"})
    @IsOptional()
    @Length(5 , 600 , {message : "توضیحات باید بین ۵ و ۶۰۰ کاراکتر باشد"})
    @ApiProperty({example: 'بهترین گوشی موبایل'})
    description: string

    @IsOptional()
    @IsString({message: "اسلاگ باید رشته باشد"})
    @ApiProperty({example: 'mobile-apple'})
    slug?: string;

    @IsNumber({}, {message: "حداقل قیمت باید عدد باشد"})
    @ApiProperty({example: 100000, description: 'حداقل قیمت محصول. اگر isVariant=true باشد، این مقدار بر اساس کمترین قیمت واریانت محاسبه می‌شود'})
    minPrice: number;

    @IsNumber({}, {message: "حداکثر قیمت باید عدد باشد"})
    @ApiProperty({example: 100000, description: 'حداکثر قیمت محصول. اگر isVariant=true باشد، این مقدار بر اساس بیشترین قیمت واریانت محاسبه می‌شود'})
    maxPrice: number;

    @IsOptional()
    @IsNumber({}, {message: "موجودی باید عدد باشد"})
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
    categories: string[] | string 

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
