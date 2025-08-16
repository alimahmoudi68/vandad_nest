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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';


import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { TvService } from './tv.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { TvCommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Tv Commnets')
@AuthDecorator()
@Controller('admin/tv-comments')
@UseInterceptors(ResponseFormatInterceptor)
export class AdminTvCommentController {
  constructor(private readonly tvCommentService: TvCommentService) {}

  @Get('/')
  @Pagination()
  @Version('1')
  find(@Query() paginationDto: PaginationDto) {
    return this.tvCommentService.find(paginationDto);
  }

  @Post('/')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Version('1')
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.tvCommentService.create(createCommentDto);
  }

  @Put('/accept/:id')
  @Version('1')
  accept(@Param('id', ParseIntPipe) id: number) {
    return this.tvCommentService.accept(id);
  }

  @Put('/reject/:id')
  @Version('1')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.tvCommentService.reject(id);
  }

  @Delete(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  remove(@Param('id') id: string) {
    return this.tvCommentService.remove(+id);
  }

  @Get(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  findOne(@Param('id') id: string) {
    return this.tvCommentService.findOneDetail(+id);
  }


  @Put(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.tvCommentService.update(+id, updateCommentDto);
  }


}
