import { Controller, Get, Post, Body, Param, Delete , UseGuards, UseInterceptors, Query, Version, Put, ParseIntPipe, } from '@nestjs/common';
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
import { BlogCommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';


@ApiTags('Blog Commnets')
@Controller('blog-comments')
@UseGuards(AuthGuard)
@ApiBearerAuth("Authorization")
@UseInterceptors(ResponseFormatInterceptor)
export class BlogCommentController {
  constructor(private readonly blogCommentService: BlogCommentService) {}

  @Get("/")
  @Pagination()
  @Version('1')
  find(@Query() paginationDto: PaginationDto){
    return this.blogCommentService.find(paginationDto);
  }

  @Post("/")
  @ApiConsumes(SwaggerConsumes.UrlEncoded , SwaggerConsumes.Json)
  @Version('1')
  create(@Body() createCommentDto: CreateCommentDto){
    return this.blogCommentService.create(createCommentDto);
  }


  @Put("/accept/:id")
  @Version('1')
  accept(@Param('id' , ParseIntPipe) id: number){
    return this.blogCommentService.accept(id);
  }

  @Put("/reject/:id")
  @Version('1')
  reject(@Param('id' , ParseIntPipe) id: number){
    return this.blogCommentService.reject(id);
  }


}

