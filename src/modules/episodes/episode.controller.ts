import { Controller, Post, Body, Put, Param, Delete, ParseIntPipe, UseInterceptors, Version } from '@nestjs/common';

import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { EpisodeService } from './episode.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';

@ApiTags('Admin Episodes')
@AuthDecorator()
@Controller('admin/episodes')
@UseInterceptors(ResponseFormatInterceptor)
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Post()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() dto: CreateEpisodeDto) {
    return this.episodeService.create(dto);
  }

  @Put(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEpisodeDto,
  ) {
    return this.episodeService.update(id, dto);
  }

  @Delete(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.episodeService.remove(id);
  }
}
