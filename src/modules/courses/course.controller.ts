import {
  Controller,
  Get,
  UseInterceptors,
  Version,
  Query,
  Param,
} from '@nestjs/common';

import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { CourseService } from './course.service';
import { ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { GetCourseDto } from './dto/get-course.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Courses')
@Controller('courses')
@UseInterceptors(ResponseFormatInterceptor)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

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

  @Get(':slug')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  findOne(@Param('slug') slug: string) {
    return this.courseService.findOneDetail(slug);
  }
}
