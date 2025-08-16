import { Controller, Get, Post, Body, Param, Delete , UseInterceptors, Query, Version, Put, } from '@nestjs/common';

import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiTags , ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { GetBlogDto } from './dto/get-blog.dto';


@ApiTags('Admin Blog')
@Controller('admin/blog')
@AuthDecorator({isAdmin: true})
@UseInterceptors(ResponseFormatInterceptor)
export class AdminBlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

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

  @Get(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Put(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(+id, updateBlogDto);
  }

  @Delete(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}

