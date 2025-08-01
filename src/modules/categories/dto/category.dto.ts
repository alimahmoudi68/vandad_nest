import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AttributeDto } from 'src/modules/attribute/dto/attribute.dto';

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

  @ApiProperty({ type: () => [AttributeDto] })
  @Expose()
  @Type(() => AttributeDto)
  attributes: AttributeDto[];
}