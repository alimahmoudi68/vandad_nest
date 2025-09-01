import { Expose, Type } from 'class-transformer';
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
  description: string;

  @Expose()
  price: number;

  @Expose()
  stock: number;

  @Expose()
  sku: string;

  @Expose()
  discount: boolean;

  @Expose()
  discountPrice: number;

  @Expose()
  @Type(() => CategoryDto)
  categories: CategoryDto[];

  @Expose()
  @Type(() => UploadDto)
  thumbnail: UploadDto;

  @Expose()
  @Type(() => UploadDto)
  images: UploadDto[];

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
} 