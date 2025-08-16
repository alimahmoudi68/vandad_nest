import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  Query,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

import { TvService } from './tv.service';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GetTvQuery } from './dto/get-tv.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';

@ApiTags('Tv')
@Controller('tvs')
@UseInterceptors(ResponseFormatInterceptor)
export class TvController {
  constructor(private readonly tvService: TvService) {}

  @Version('1')
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'nestjs' })
  @ApiQuery({ name: 'cat', required: false, type: String, example: 'tech' })
  findAll(
    @Query() getBlogQuery: GetTvQuery,
  ) {
    const { page, limit, ...filterTvDto } = getBlogQuery;
    const paginationDto: PaginationDto = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };
    return this.tvService.findAll(paginationDto, filterTvDto);
  }

  @Get(':slug')
  @Version('1')
  findOneDetail(@Param('slug') slug: string) {
    return this.tvService.findOneDetail(slug);
  }

}
