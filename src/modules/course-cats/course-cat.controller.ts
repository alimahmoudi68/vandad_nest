import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Version,
  UseInterceptors,
  UseGuards,
  Put
} from '@nestjs/common';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';

import { AuthGuard } from '../auth/guards/auth.guard';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { CourseCategoryService } from './course-cat.service';
import { CreateCourseCatDto } from './dto/create-course-cat.dto';
import { UpdateCourseCatDto } from './dto/update-course-cat.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';

@ApiTags('Admin Course Cats')
@UseGuards(AuthGuard)
@UseInterceptors(ResponseFormatInterceptor)
@Controller('admin/course-cats')
export class CourseCategoryController {
  constructor(private readonly courseCategoryService: CourseCategoryService) {}

  @Post()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.Json)
  create(@Body() createCourseCatDto: CreateCourseCatDto) {
    return this.courseCategoryService.create(createCourseCatDto);
  }

  @Get()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.Json)
  findAll() {
    return this.courseCategoryService.findAll();
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.courseCategoryService.findOne(+id);
  }

  @Put(':id')
  @Version('1')
  update(
    @Param('id') id: string,
    @Body() updateCourseCatDto: UpdateCourseCatDto,
  ) {
    return this.courseCategoryService.update(+id, updateCourseCatDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.courseCategoryService.remove(+id);
  }
}
