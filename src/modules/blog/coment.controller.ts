import { Controller, Post, Body, UseInterceptors, Version } from '@nestjs/common';
import { ApiTags , ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { BlogCommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';


@ApiTags('Blog Commnets')
@AuthDecorator()
@Controller('blog-comments')
@ApiBearerAuth("Authorization")
@UseInterceptors(ResponseFormatInterceptor)
export class BlogCommentController {
  constructor(private readonly blogCommentService: BlogCommentService) {}

  @Post("/")
  @ApiConsumes(SwaggerConsumes.UrlEncoded , SwaggerConsumes.Json)
  @Version('1')
  create(@Body() createCommentDto: CreateCommentDto){
    return this.blogCommentService.create(createCommentDto);
  }

}

