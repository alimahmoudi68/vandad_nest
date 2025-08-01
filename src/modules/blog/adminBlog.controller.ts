import { Controller, Get, Post, Body, Param, Delete , UseGuards, UseInterceptors, Query, Version, Put, } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiTags , ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { FilterBlog } from 'src/common/decorators/filterBlog.decorator';
import { FilterBlogDto } from 'src/common/dto/filterBlog.dto';


@ApiTags('Admin Blog')
@Controller('admin/blog')
@UseGuards(AuthGuard)
@ApiBearerAuth("Authorization")
@UseInterceptors(ResponseFormatInterceptor)
export class AdminBlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @Pagination()
  @FilterBlog() 
  @Version('1')
  @Get()
  findAll(@Query() paginationDto: PaginationDto , @Query() filterBlogDto: FilterBlogDto) {
    return this.blogService.findAll(paginationDto , filterBlogDto);
  }

  @Get(':id')
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
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}

