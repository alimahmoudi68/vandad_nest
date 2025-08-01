import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class addUserToReqWOV implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractToken(req);
    if (!token) {
      return next();
    }
    try {
      let user = await this.authService.validateToken(token, 'access');
      if (user) {
        req.user = user;
      }
    } catch (err) {
      console.log(err);
    }
    next();
  }

  protected extractToken(request: Request) {
    const cookies = request.headers.cookie;

    if (!cookies) {
      return null;
    }

    const cookieArray = cookies.split('; ');

    let accessToken: string | null = null;
    cookieArray.forEach((cookie) => {
      if (cookie.startsWith('accessToken=')) {
        accessToken = cookie.split('=')[1]; // استخراج accessToken
      }
    });

    if (!accessToken) {
      return null;
    }

    return accessToken;
  }
}
