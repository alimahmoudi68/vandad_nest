import { PartialType } from '@nestjs/swagger';
import { CreateCourseCatDto } from './create-course-cat.dto';

export class UpdateCourseCatDto extends PartialType(CreateCourseCatDto) {}
