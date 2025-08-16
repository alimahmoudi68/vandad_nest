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
import { REQUIRE_ADMIN } from 'src/common/decorators/require-admin.decorator';

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

    const user = await this.authService.validateToken(token, 'access');

    const requireAdmin = this.reflector.get<boolean>(
      REQUIRE_ADMIN,
      context.getHandler(),
    );

    if (requireAdmin && !user.isAdmin) {
      throw new ForbiddenException('دسترسی این بخش فقط برای ادمین مجاز است');
    }

    request.user = user;
    return true;
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
    const accessToken = request.cookies?.['accessToken'];
    if (accessToken) {
      return accessToken;
    }

    // Alternative cookie parsing method
    const cookies = request.headers.cookie;
    if (cookies) {
      const cookieArray = cookies.split('; ');
      for (const cookie of cookieArray) {
        if (cookie.startsWith('access-token=')) {
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