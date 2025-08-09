import { Controller, Get, Post, Body, Param, Delete , UseGuards, UseInterceptors, Query, Version, Put, } from '@nestjs/common';
import { BlogService } from './blog.service';
import { ApiTags , ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { GetBlogDto } from './dto/get-blog.dto';


@ApiTags('Blog')
@Controller('blog')
@UseInterceptors(ResponseFormatInterceptor)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}


  @Version('1')
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'nestjs' })
  @ApiQuery({ name: 'cat', required: false, type: String, example: 'tech' })
  findAll(@Query() getBlogQuery: GetBlogDto) {
    const { page, limit, ...filterBlogDto } = getBlogQuery;
    const paginationDto: PaginationDto = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };
    return this.blogService.findAll(paginationDto, filterBlogDto);
  }

  @Get(':slug')
  @SkipAuth()
  @Version('1')
  findOneDetail(@Param('slug') slug: string) {
    return this.blogService.findOneDetail(slug);
  }

  
  @Get('like/:id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  like(@Param('id') id: string) {
    return this.blogService.like(+id);
  }
}

