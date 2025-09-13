import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Version,
  Query,
  UseInterceptors,
} from '@nestjs/common';

import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { AdminCategoriesService } from './adminCategories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('admin/categories')
@AuthDecorator()
@UseInterceptors(ResponseFormatInterceptor)
@ApiTags('Admin Categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: AdminCategoriesService) {}

  @Post()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.MultipartData )
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Pagination()
  @Version('1')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoriesService.findAll(paginationDto);
  }

  @Get('parents')
  @Pagination()
  @Version('1')
  findAllParents() {
    return this.categoriesService.findAllParents();
  }

  @Get('childs')
  @Version('1')
  findAllChilds() {
    return this.categoriesService.findAllChilds();
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Put(':id')
  @Version('1')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
