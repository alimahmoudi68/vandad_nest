import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Version, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { ApiTags } from '@nestjs/swagger';

@Controller('tickets')
@UseInterceptors(ResponseFormatInterceptor)
@ApiTags('Tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post("new")
  @Version('1')
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @Version('1')
  findAll(
     @Query("page" , new DefaultValuePipe(1) , ParseIntPipe ) page: number, 
     @Query("limit" , new DefaultValuePipe(10) , ParseIntPipe) limit: number) {
     return this.ticketsService.findAll(page , limit);
   }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(+id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}

