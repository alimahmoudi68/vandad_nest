import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Version,
  Query
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Pagination } from 'src/common/decorators/pagination.decorator';

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

  
  @Get(':slug')
  @Version('1')
  findOne(@Param('id') slug: string) {
    return this.productsService.findOne(slug);
  }

}
