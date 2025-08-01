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


@ApiTags('Blog')
@Controller('blog')
@UseGuards(AuthGuard)
@ApiBearerAuth("Authorization")
@UseInterceptors(ResponseFormatInterceptor)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}


  @SkipAuth()
  @Pagination()
  @FilterBlog() 
  @Version('1')
  @Get()
  findAll(@Query() paginationDto: PaginationDto , @Query() filterBlogDto: FilterBlogDto) {
    return this.blogService.findAll(paginationDto , filterBlogDto);
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

