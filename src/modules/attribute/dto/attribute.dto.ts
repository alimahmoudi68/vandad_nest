import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AttributeMetaDto } from './attribute-meta.dto';

export class AttributeDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  slug: string;

  @ApiProperty()
  @Expose()
  isDynamic: boolean;

  @ApiProperty({ type: () => [AttributeMetaDto] })
  @Expose()
  @Type(() => AttributeMetaDto)
  metas: AttributeMetaDto[];
}