import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, Version, Query } from '@nestjs/common';
import { AttributeMetaService } from './attributeMeta.service';
import { ApiTags } from '@nestjs/swagger';

import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import {CreateAttributeMetaDto} from './dto/create-attributeMeta.dto';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@AuthDecorator()
@Controller('admin/attribute-metas')
@UseInterceptors(ResponseFormatInterceptor)
@ApiTags('Attribute Metas')
export class AttributeMetaController {
  constructor(private readonly attributeMetaService: AttributeMetaService) {}

  @Get()
  @Pagination()
  @Version('1')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.attributeMetaService.findAll(paginationDto);
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.attributeMetaService.findOne(+id);
  }

  @Post()
  @Version('1')
  create(@Body() createDto: CreateAttributeMetaDto) {
    return this.attributeMetaService.create(createDto);
  }

  @Put(':id')
  @Version('1')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.attributeMetaService.update(+id, updateDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.attributeMetaService.remove(+id);
  }
} 