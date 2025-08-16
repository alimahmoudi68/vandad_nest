import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Version,
  UseInterceptors,
  Put
} from '@nestjs/common';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';


import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { TvCategoryService } from './tv-cat.service';
import { CreateTvCatDto } from './dto/create-tv-cat.dto';
import { UpdateTvCatDto } from './dto/update-tv-cat.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';

@ApiTags('Admin Tv Cats')
@AuthDecorator()
@UseInterceptors(ResponseFormatInterceptor)
@Controller('admin/tv-cats')
export class TvCategoryController {
  constructor(private readonly tvCategoryService: TvCategoryService) {}

  @Post()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.Json)
  create(@Body() createTvCatDto: CreateTvCatDto) {
    return this.tvCategoryService.create(createTvCatDto);
  }

  @Get()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.Json)
  findAll() {
    return this.tvCategoryService.findAll();
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.tvCategoryService.findOne(+id);
  }

  @Put(':id')
  @Version('1')
  update(
    @Param('id') id: string,
    @Body() updateTvCatDto: UpdateTvCatDto,
  ) {
    return this.tvCategoryService.update(+id, updateTvCatDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.tvCategoryService.remove(+id);
  }
}
