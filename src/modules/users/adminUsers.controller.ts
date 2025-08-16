import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Version,
  Res,
  Query,
  UseInterceptors,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { AdminUserService } from './adminUsers.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { ProfileDto } from './dto/profile.dto';

@Controller('admin/users')
@AuthDecorator({isAdmin: true})
@UseInterceptors(ResponseFormatInterceptor)
@ApiTags('Users (custome Tag)')
export class AdminUsersController {
  constructor(private readonly userService: AdminUserService) {}


  // این برای مبنای مدیریت خطا
  @Post('new')
  @Version('1')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Version('1')
  async findAll(
    @Query('limit' , new DefaultValuePipe(10) , ParseIntPipe) limit: number ,
    @Query('page' , new DefaultValuePipe(1) , ParseIntPipe) page: number,
    @Query('admin' ,  new DefaultValuePipe(0) , ParseIntPipe) admin: number 
    ) {
    return await this.userService.findAll(limit , page , admin);
  }

  @Get(':id')
  async findOne(@Param('id') id: string , @Res() res : Response) {
    return this.userService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post("profiles/new")
  @Version('1')
  newProfile(@Body() profileDto: ProfileDto){
    return this.userService.createProfile(profileDto);
  }
}
