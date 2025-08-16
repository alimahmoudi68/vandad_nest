import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseIntPipe ,UseInterceptors , Version, DefaultValuePipe} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';

import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';

@Controller('addresses')
@AuthDecorator()
@UseInterceptors(ResponseFormatInterceptor)
@ApiTags('Addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post("new")
  @Version('1')
  @ApiConsumes(SwaggerConsumes.UrlEncoded , SwaggerConsumes.Json )
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(createAddressDto); 
  }


  @Get()
  @Version('1')
  findAll(
    @Query("page" , new DefaultValuePipe(1) , ParseIntPipe ) page: number, 
    @Query("limit" , new DefaultValuePipe(10) , ParseIntPipe) limit: number) {
    return this.addressService.findAll(page , limit);
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(+id);
  }

  @Put(':id')
  @Version('1')
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(+id, updateAddressDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.addressService.remove(+id);
  }
}
