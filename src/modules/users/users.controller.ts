import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Version,  
  Res,
  HttpStatus,
  Query,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request , Response} from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';

@Controller('users')
@UseInterceptors(ResponseFormatInterceptor)
@ApiTags('Users (custome Tag)')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Version('1')
  @ApiBearerAuth("Authorization")
  getMe(@Req() request: Request) {
    return {
      user:request.user
    };
  }

  @Post("new")
 async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }


  @Get()
  @Version('1')
  async findAll(
    @Res() res : Response,
    @Query('limit') limit: number = 10 ,
    @Query('page') page: number = 1,
    @Query('admin') admin: boolean = false
    ) {

    const users = await this.userService.findAll(limit , page , admin);
    return res.status(HttpStatus.OK).json({
        status: 'success',
        users,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string , @Res() res : Response) {
    const user = this.userService.findOne(+id);
    return res.status(HttpStatus.OK).json({
      status: 'success',
      user,
  });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }


}
