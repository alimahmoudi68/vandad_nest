import {
  Controller,
  Post,
  Body,
  Version,
  Res,
  Req,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Response } from 'express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';

@Controller('auth')
@ApiTags('Auth')
@UseInterceptors(ResponseFormatInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/otp')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Version('1')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return await this.authService.sendOtp(sendOtpDto);
  }

  @Post('/verify')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Version('1')
  checkOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res() res: Response) {
    return this.authService.verifyOtp(verifyOtpDto, res);
  }

  @Post('/refresh-token')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Version('1')
  refreshToken(@Res() res: Response) {
    return this.authService.refreshToken(res);
  }
}
