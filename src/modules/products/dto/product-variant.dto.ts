import { Expose, Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProductVariantAttributeDto } from './product-variant-attribute.dto';
import { UploadDto } from 'src/modules/upload/dto/upload.dto';

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

  @ApiProperty({ type: () => [UploadDto], description: 'Array of image objects' })
  @Expose()
  @Type(() => UploadDto)
  images: UploadDto[];

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
