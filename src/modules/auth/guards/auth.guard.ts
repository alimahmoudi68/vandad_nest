import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { SKIP_AUTH } from 'src/common/decorators/skip-auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isSkippedAuthorization = this.reflector.get<boolean>(
      SKIP_AUTH,
      context.getHandler(),
    );
    if (isSkippedAuthorization) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    request.user = await this.authService.validateToken(token, 'access');
    return true;
  }

  protected extractToken(request: Request) {
    
    const {authorization} = request.headers;
    if(!authorization || authorization?.trim() == ""){
        throw new ForbiddenException("شما دسترسی ندارید");
    }

    const [bearer , token] = authorization.split(" ");
    if(bearer?.toLowerCase() !== 'bearer' || !token){
        throw new ForbiddenException("شما دسترسی ندارید");
    }

    return token;

    // جور دیگر گرفتن کوی
    //const accessToken1 = request.cookies?.['accessToken'];
    //console.log(accessToken1)

    // const cookies = request.headers.cookie;

    // if (!cookies) {
    //   throw new ForbiddenException('شما دسترسی ندارید');
    // }

    // const cookieArray = cookies.split('; ');

    // let accessToken: string | null = null;
    // cookieArray.forEach((cookie) => {
    //   if (cookie.startsWith('access-token=')) {
    //     accessToken = cookie.split('=')[1]; // استخراج accessToken
    //   }
    // });

    // if (!accessToken) {
    //   throw new ForbiddenException('شما دسترسی ندارید');
    // }

    // return accessToken;
  }
}
