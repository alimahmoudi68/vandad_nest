import { Expose, Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProductVariantAttributeDto } from './product-variant-attribute.dto';

export class ProductVariantDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  sku: string;

  @ApiProperty()
  @Expose()
  price: string;

  @ApiProperty()
  @Expose()
  stock: number;

  @ApiProperty()
  @Expose()
  discount: boolean;

  @ApiProperty()
  @Expose()
  discountPrice: number;

  @ApiProperty({ type: [Number], description: 'Array of image IDs' })
  @Expose()
  @Transform(({ value }) => value?.map((img: any) => img.id) || [])
  images: number[];

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: () => [ProductVariantAttributeDto] })
  @Expose()
  @Type(() => ProductVariantAttributeDto)
  attributes: ProductVariantAttributeDto[];
}
