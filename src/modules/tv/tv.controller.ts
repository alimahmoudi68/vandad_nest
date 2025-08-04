import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
  Version,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';

import { TvService } from './tv.service';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { FilterBlog } from 'src/common/decorators/filterBlog.decorator';
import { FilterBlogDto } from 'src/common/dto/filterBlog.dto';

@ApiTags('Tv')
@Controller('tvs')
@UseInterceptors(ResponseFormatInterceptor)
export class TvController {
  constructor(private readonly tvService: TvService) {}

  @Pagination()
  @FilterBlog()
  @Version('1')
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterBlogDto: FilterBlogDto,
  ) {
    return this.tvService.findAll(paginationDto, filterBlogDto);
  }

  @Get(':slug')
  @Version('1')
  findOneDetail(@Param('slug') slug: string) {
    return this.tvService.findOneDetail(slug);
  }

}
