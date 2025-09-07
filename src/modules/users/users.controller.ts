import {
  Controller,
  Get,
  Put,
  Version,  
  UseInterceptors,
  Req,
  ForbiddenException,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { UserService } from './users.service';
import { Request } from 'express';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';

@Controller('users')
@AuthDecorator()
@UseInterceptors(ResponseFormatInterceptor)
@ApiTags('Users (custome Tag)')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Version('1')
  @ApiBearerAuth("Authorization")
  getMe(@Req() request: Request) {
    return {
      user: request.user
    };
  }


  @Get('profile')
  @Version('1')
  @ApiBearerAuth("Authorization")
  getProfile(@Req() request: Request) {
    const userId= request.user?.id;
    if(userId){
      return this.userService.getProfile(+userId);
    }
    else{
      return new ForbiddenException();
    }
  }

  @Put('profile')
  @Version('1')
  @ApiBearerAuth("Authorization")
  updateProfile(@Req() request: Request, @Body() updateProfileDto: UpdateProfileDto) {
    const userId= request.user?.id;
    if(userId){
      return this.userService.updateProfile(+userId, updateProfileDto);
    }
    else{
      return new ForbiddenException();
    }
  }


}
