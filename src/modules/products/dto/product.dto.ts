import { Expose, Type, Transform } from 'class-transformer';
import { ProductAttributeDto } from './product-attribute.dto';
import { ProductVariantDto } from './product-variant.dto';
import { CategoryDto } from 'src/modules/categories/dto/category.dto';
import { UploadDto } from 'src/modules/upload/dto/upload.dto';


export class ProductDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  slug: string;

  @Expose()
  isVariant: boolean;

  @Expose()
  description: string;

  @Expose()
  discount: boolean;

  @Expose()
  discountPrice: number;

  @Expose()
  @Type(() => CategoryDto)
  categories: CategoryDto[];

  @Expose()
  @Type(() => ProductAttributeDto)
  attributes: ProductAttributeDto[];

  @Expose()
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];

  @Expose()
  price: number;

  @Expose()
  stock: number;

  @Expose()
  sku: string;

  @Expose()
  @Type(() => UploadDto)
  thumbnail: UploadDto;

  @Expose()
  images: UploadDto[];
} 