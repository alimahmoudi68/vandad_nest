import { Expose, Type } from 'class-transformer';
import { CategoryDto } from 'src/modules/categories/dto/category.dto';


export class ProductDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  slug: string;


  @Expose()
  discount: boolean;

  @Expose()
  discountPrice: number;

  @Expose()
  @Type(() => CategoryDto)
  categories: CategoryDto[];

} 