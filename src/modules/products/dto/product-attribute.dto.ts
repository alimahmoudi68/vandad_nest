import { Expose, Type } from 'class-transformer';
import { AttributeDto } from '../../attribute/dto/attribute.dto';
import { AttributeMetaDto } from '../../attribute/dto/attribute-meta.dto';

export class ProductAttributeDto {
  @Expose()
  id: number;

  @Expose()
  value: string;

  @Expose()
  @Type(() => AttributeDto)
  attribute: AttributeDto;

  @Expose()
  @Type(() => AttributeMetaDto)
  attributeMeta: AttributeMetaDto;
} 