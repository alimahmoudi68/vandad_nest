import { Controller, Post, Body, Get, UseInterceptors, Version, Query, Param, Put, Delete } from '@nestjs/common';

import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { GetCourseDto } from './dto/get-course.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';



@ApiTags('Admin Course')
@AuthDecorator({isAdmin: true})
@Controller('admin/courses')
@UseInterceptors(ResponseFormatInterceptor)
@ApiBearerAuth("Authorization")
export class AdminCourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() dto: CreateCourseDto) {
    return this.courseService.create(dto);
  }

  @Get()
  @Version('1')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'nestjs' })
  @ApiQuery({ name: 'cat', required: false, type: String, example: 'tech' })
  findAll(@Query() getCourseDto: GetCourseDto) {
    const { page, limit, ...filterBlogDto } = getCourseDto;
    const paginationDto: PaginationDto = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };
    return this.courseService.findAll(paginationDto, filterBlogDto);
  }

  @Get(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Put(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}
