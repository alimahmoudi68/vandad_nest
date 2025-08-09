import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Version,
  UseInterceptors,
  UseGuards,
  Put
} from '@nestjs/common';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';

import { AuthGuard } from '../auth/guards/auth.guard';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { BlogCategoryService } from './blog-cat.service';
import { CreateBlogCatDto } from './dto/create-blog-cat.dto';
import { UpdateBlogCatDto } from './dto/update-blog-cat.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';

@ApiTags('Admin Blog Cats')
@UseGuards(AuthGuard)
@UseInterceptors(ResponseFormatInterceptor)
@Controller('admin/blog-cats')
export class AdminBlogCategoryController {
  constructor(private readonly blogCategoryService: BlogCategoryService) {}

  @Post()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.Json)
  create(@Body() createBlogCatDto: CreateBlogCatDto) {
    return this.blogCategoryService.create(createBlogCatDto);
  }

  @Get()
  @Version('1')
  @ApiConsumes(SwaggerConsumes.Json)
  findAll() {
    return this.blogCategoryService.findAll();
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.blogCategoryService.findOne(+id);
  }

  @Put(':id')
  @Version('1')
  update(
    @Param('id') id: string,
    @Body() updateBlogCatDto: UpdateBlogCatDto,
  ) {
    return this.blogCategoryService.update(+id, updateBlogCatDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.blogCategoryService.remove(+id);
  }
}
