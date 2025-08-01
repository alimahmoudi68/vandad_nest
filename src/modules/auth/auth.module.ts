import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserEntity } from '../users/entities/user.entity';
import { OtpEntity } from '../users/entities/otp.entity';
import { OtpAllowEntity } from '../users/entities/otpAllow.entity';
import { SmsModule } from '../sms/sms.module';


@Module({
  imports: [
    SmsModule ,
    TypeOrmModule.forFeature([UserEntity, OtpEntity, OtpAllowEntity]), 
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  exports: [AuthService, JwtService, TypeOrmModule , SmsModule],
})
export class AuthModule {}
