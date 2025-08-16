import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, Version, Query, Put } from '@nestjs/common';

import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { AttributeService } from './attribute.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';


@AuthDecorator()
@Controller('admin/attributes')
@UseInterceptors(ResponseFormatInterceptor)
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Post()
  @Version('1')
  create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributeService.create(createAttributeDto);
  }

  @Get()
  @Version('1')
  @Pagination()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.attributeService.findAll(paginationDto);
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.attributeService.findOne(+id);
  }

  @Put(':id')
  @Version('1')
  update(@Param('id') id: string, @Body() updateAttributeDto: UpdateAttributeDto) {
    return this.attributeService.update(+id, updateAttributeDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.attributeService.remove(+id);
  }
}
