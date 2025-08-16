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
  Put,
} from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiQuery } from '@nestjs/swagger';

import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { TvService } from './tv.service';
import { CreateTvDto } from './dto/create-tv.dto';
import { UpdateTvDto } from './dto/update-tv.dto';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { GetTvQuery } from './dto/get-tv.dto';

@ApiTags('Admin Tv')
@AuthDecorator()
@Controller('admin/tv')
@UseInterceptors(ResponseFormatInterceptor)
export class AdminTvController {
  constructor(private readonly tvService: TvService) {}

  @Post()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() createTvDto: CreateTvDto) {
    return this.tvService.create(createTvDto);
  }

  @Version('1')
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'nestjs' })
  @ApiQuery({ name: 'cat', required: false, type: String, example: 'tech' })
  findAll(@Query() getTvQuery: GetTvQuery) {
    const { page, limit, ...filterBlogDto } = getTvQuery;
    const paginationDto: PaginationDto = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };
    return this.tvService.findAll(paginationDto, filterBlogDto);
  }

  @Get(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  findOne(@Param('id') id: string) {
    return this.tvService.findOne(+id);
  }

  @Put(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(@Param('id') id: string, @Body() updateTvDto: UpdateTvDto) {
    return this.tvService.update(+id, updateTvDto);
  }

  @Delete(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  remove(@Param('id') id: string) {
    return this.tvService.remove(+id);
  }
}
