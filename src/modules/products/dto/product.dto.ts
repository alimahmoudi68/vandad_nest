import { Expose, Type } from 'class-transformer';
import { ProductAttributeDto } from './product-attribute.dto';
import { ProductVariantDto } from './product-variant.dto';
import { CategoryDto } from 'src/modules/categories/dto/category.dto';


export class ProductDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  slug: string;

  @Expose()
  minPrice: number;

  @Expose()
  maxPrice: number;

  @Expose()
  isVariant: boolean;

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
} 