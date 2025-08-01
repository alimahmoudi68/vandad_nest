import { PartialType } from '@nestjs/mapped-types';
import { CreateAttributeMetaDto } from './create-attributeMeta.dto';

export class UpdateAttributeMetaDto extends PartialType(CreateAttributeMetaDto) {} 