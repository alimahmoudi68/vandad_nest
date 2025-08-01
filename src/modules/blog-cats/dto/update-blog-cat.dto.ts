import { PartialType } from '@nestjs/swagger';
import { CreateBlogCatDto } from './create-blog-cat.dto';

export class UpdateBlogCatDto extends PartialType(CreateBlogCatDto) {}
