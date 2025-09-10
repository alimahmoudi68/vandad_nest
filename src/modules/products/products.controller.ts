import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  UseInterceptors,
  Version,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { BookmarkDto } from './dto/bookmark.dto';
import { Request } from 'express';

@Controller('products')
@UseInterceptors(ResponseFormatInterceptor)
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded , SwaggerConsumes.Json)
  @Pagination() 
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Put('bookmark')
  @Version('1')
  @UseGuards(AuthGuard)
  bookmark(@Body() bookmarkDto: BookmarkDto) {
    return this.productsService.bookmark(bookmarkDto);
  }

}
