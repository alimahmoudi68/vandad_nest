import { PartialType } from '@nestjs/swagger';
import { CreateTvCatDto } from './create-tv-cat.dto';

export class UpdateTvCatDto extends PartialType(CreateTvCatDto) {}
