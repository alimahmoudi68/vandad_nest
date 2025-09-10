import { Expose, Type } from 'class-transformer';
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
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: () => [ProductVariantAttributeDto] })
  @Expose()
  @Type(() => ProductVariantAttributeDto)
  attributes: ProductVariantAttributeDto[];
}
