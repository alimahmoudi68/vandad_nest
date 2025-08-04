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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { TvService } from './tv.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { TvCommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Tv Commnets')
@Controller('tv-comments')
@UseGuards(AuthGuard)
@ApiBearerAuth('Authorization')
@UseInterceptors(ResponseFormatInterceptor)
export class TvCommentController {
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
}
