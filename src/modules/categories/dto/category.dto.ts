import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  slug: string;

  @ApiProperty({ required: false })
  @Expose()
  description?: string;


  @ApiProperty({ type: () => [CategoryDto], description: 'فرزندان دسته‌بندی' })
  @Expose()
  @Type(() => CategoryDto)
  children?: CategoryDto[];
}