import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseInterceptors,
  Version,
  Query,
} from '@nestjs/common';
import { AdminProductsService } from './adminProducts.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Pagination } from 'src/common/decorators/pagination.decorator';

@Controller('admin/products')
@UseInterceptors(ResponseFormatInterceptor)
@ApiTags('Admin Products')
export class AdminProductsController {
  constructor(private readonly productsService: AdminProductsService) {}

  @Post("")
  @Version('1')
  @ApiConsumes(SwaggerConsumes.Json , SwaggerConsumes.MultipartData )
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded , SwaggerConsumes.Json)
  @Pagination() 
  findAll(@Query() query: any) {
    const { page, limit } = query;
    const paginationDto: PaginationDto = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    };
    return this.productsService.findAll(paginationDto);
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }
  
  @Put(':id')
  @Version('1')
  @ApiConsumes(SwaggerConsumes.Json , SwaggerConsumes.MultipartData )
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}



// new product
// {
//   "title": "گوشی اپل جدید",
//   "slug": "mobile-apple2",
//   "description": "بهترین گوشی موبایل",
//   "isVariant": false,
//   "price": 100000,
//   "minPrice": 100000,
//   "maxPrice": 100000,
//   "discount": false,
//   "discountPrice": 0,
//   "images": [],
//   "stock": 10,
//   "sku": "simple-sku",
//   "categories": [
//       1
//   ],
//   "attributes": {
//       "color" : 1
//   }
//   "variants": [
//     {
//         "attributes": {
//             "color": 1
//         },
//         "price": 120000,
//         "stock": 5,
//         "sku": "variant-sku-1"
//     },
//          {
//         "attributes": {
//             "color": 2
//         },
//         "price": 100000,
//         "stock": 5,
//         "sku": "variant-sku-2"
//     }
// ]

// }