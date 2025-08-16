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
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { TvCommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Tv Commnets')
@AuthDecorator()
@Controller('tv-comments')
@UseInterceptors(ResponseFormatInterceptor)
export class TvCommentController {
  constructor(private readonly tvCommentService: TvCommentService) {}


  @Post('/')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Version('1')
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.tvCommentService.create(createCommentDto);
  }

 

 
}
