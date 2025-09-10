import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AttributeDto } from 'src/modules/attribute/dto/attribute.dto';
import { AttributeMetaDto } from 'src/modules/attribute/dto/attribute-meta.dto';

export class ProductVariantAttributeDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty({ type: () => AttributeDto })
  @Expose()
  @Type(() => AttributeDto)
  attribute: AttributeDto;

  @ApiProperty({ type: () => AttributeMetaDto })
  @Expose()
  @Type(() => AttributeMetaDto)
  attributeMeta: AttributeMetaDto;

  @ApiProperty()
  @Expose()
  value: string;
}