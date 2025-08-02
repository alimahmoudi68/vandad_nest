import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compareSync } from 'bcrypt';
import { Request, Response } from 'express';
import { REQUEST } from '@nestjs/core';

import { TokenPayload } from './types/payload';
import { VerifyResult } from './types/verfyResult';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { OtpEntity } from '../users/entities/otp.entity';
import { UserEntity } from '../users/entities/user.entity';
import { OtpAllowEntity } from '../users/entities/otpAllow.entity';
import { getIp } from 'src/utils/auth/getIp';
import makeOtp from 'src/utils/auth/makeOtp';
import makeOtpToken from 'src/utils/auth/makeOtpToken';
import { SmsService } from '../sms/sms.service';

// ما میتوانستیم یوزرو سرویس را ایمپورت کنیم و اونجوری کاربر بسازیم

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,
    @InjectRepository(OtpAllowEntity)
    private otpAllowRepository: Repository<OtpAllowEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly smsService: SmsService,
    @Inject(REQUEST) private request: Request,
  ) {}

  async sendOtp(sendOtpDto: SendOtpDto) {
    const { phone } = sendOtpDto;

    // checkAdmin
    // const user = await this.userRepository.findOne({ where: { phone } });
    // if (!user?.isAdmin) {
    //   throw new ForbiddenException('شما دسترسی لازم برای این عمل را ندارید');
    // }

    let ip = getIp(this.request);

    // ---- is allow otp -----
    const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000);

    let otpAllow = await this.otpAllowRepository.findOne({ where: { ip } });

    if (otpAllow) {
      if (otpAllow.date > oneHourAgo) {
        if (otpAllow.count < 6) {
          otpAllow.count += 1;
          otpAllow.date = new Date();
        } else {
          throw new UnauthorizedException(
            'شما بیش از حد تلاش کرده‌اید، لطفاً ساعاتی بعد مجدد تلاش کنید',
          );
        }
      } else {
        otpAllow.count = 1;
        otpAllow.date = new Date();
      }
      await this.otpAllowRepository.save(otpAllow);
    } else {
      otpAllow = this.otpAllowRepository.create({
        ip,
        count: 1,
        date: new Date(),
      });
      await this.otpAllowRepository.save(otpAllow);
    }

    // ---- /is allow otp -----

    const { otp, hashOtp } = makeOtp(5);
    const token = makeOtpToken();

    // ---- save otp ----
    let otpExist = await this.otpRepository.findOne({ where: { phone } });

    if (otpExist) {
      otpExist.otp = hashOtp;
      otpExist.token = token;
      otpExist.date = new Date();
      await this.otpRepository.save(otpExist);
    } else {
      let newOtp = this.otpRepository.create({
        phone,
        otp: hashOtp,
        token,
        date: new Date(),
      });
      await this.otpRepository.save(newOtp);
    }

    // ---- /save otp ----
    this.smsService.sendSms(
      phone,
      this.configService.get('Sms.loginPattern') ?? '',
      { code: otp },
    );
    console.log('send sms, code ->', otp);
    return { token };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto, res: Response) {
    const { token, otp } = verifyOtpDto;

    let threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

    const otpFounded = await this.otpRepository.findOne({
      where: {
        token: token,
        date: MoreThanOrEqual(threeMinutesAgo),
      },
    });

    if (!otpFounded) {
      throw new UnauthorizedException('کد نامعتبر است یا منقضی شده است');
    }

    const isValidOtp = compareSync(otp, otpFounded.otp);

    if (!isValidOtp) {
      throw new UnauthorizedException('کد نامعتبر است یا منقضی شده است');
    }

    // set user.active to true

    let user = await this.userRepository.findOne({
      where: { phone: otpFounded.phone },
    });

    if (!user) {
      user = this.userRepository.create({
        phone: otpFounded.phone,
        active: true,
      });
      await this.userRepository.save(user);
    }

    if (!user.active) {
      user.active = true;
      await this.userRepository.save(user);
    }

    const tokens = this.makeTokens({ id: user.id });
    return this.sendResponse(res, tokens);
  }

  sendResponse(res: Response, result: VerifyResult) {
    const { accessToken, refreshToken } = result;
    // res.cookie('accessToken', accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: 15 * 60 * 1000, // 15 دقیقه
    // });

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: 30 * 24 * 60 * 60 * 1000, // ۳۰ روز
    // });

    res.status(200).json({
      status: 'success',
      accessToken,
      refreshToken,
    });
  }

  makeTokens = (payload: TokenPayload) => {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('Jwt.accessTokenSecret'),
      expiresIn: '30d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('Jwt.refreshTokenSecret'),
      expiresIn: '1y',
    });

    return {
      accessToken,
      refreshToken,
    };
  };

  async validateToken(
    token: string,
    tokenType: 'access' | 'refresh' = 'access',
  ) {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token, {
        secret: this.configService.get(`Jwt.${tokenType}TokenSecret`),
      });

      if (typeof payload !== 'object' || !payload?.id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // اگر توکن رفرش بود، بررسی کنیم که با توکن ذخیره شده در DB مطابقت دارد
      // if (tokenType === 'refresh' && user.refreshToken !== token) {
      //   throw new UnauthorizedException('Refresh token mismatch');
      // }

      return user;
    } catch (err) {
      throw new UnauthorizedException(
        err.message || `Invalid ${tokenType} token`,
      );
    }
  }

  // async validationAccessToken(token: string) {
  //   try {
  //     const payload = this.jwtService.verify<TokenPayload>(token, {
  //       secret: this.configService.get('Jwt.accessTokenSecret'),
  //     });

  //     if (typeof payload == 'object' && payload?.id) {
  //       const user = await this.userRepository.findOne({
  //         where: { id: payload.id },
  //       });
  //       if (!user) {
  //         throw new UnauthorizedException('login on your accoumt3');
  //       }
  //       return user;
  //     } else {
  //       throw new UnauthorizedException('login on your accoumt2');
  //     }
  //   } catch (err) {
  //     throw new UnauthorizedException('login on your accoumt1');
  //   }
  // }

  async refreshToken(res: Response) {
    const token = this.extractToken(this.request);
    const user = await this.validateToken(token, 'refresh');
    const tokens = this.makeTokens({ id: user.id });
    return this.sendResponse(res, tokens);
  }

  protected extractToken(request: Request) {

    // First try to get token from Authorization header
    const { authorization } = request.headers;
    if (authorization && authorization.trim() !== '') {
      const [bearer, token] = authorization.split(' ');
      if (bearer?.toLowerCase() === 'bearer' && token) {
        return token;
      }
    }

    // If no authorization header, try to get from cookies
    const accessToken = request.cookies?.['refresh-token'];
    if (accessToken) {
      return accessToken;
    }

    // Alternative cookie parsing method
    const cookies = request.headers.cookie;
    if (cookies) {
      const cookieArray = cookies.split('; ');
      for (const cookie of cookieArray) {
        if (cookie.startsWith('refresh-token=')) {
          const token = cookie.split('=')[1];
          if (token) {
            return token;
          }
        }
      }
    }

    // If no token found in either method, throw error
    throw new ForbiddenException('شما دسترسی ندارید');
  }
}
