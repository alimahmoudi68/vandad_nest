import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorService } from '../modules/error/error.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly errorService: ErrorService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'مشکلی در سرور رخ داده است. لطفاً بعداً تلاش کنید.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseMessage = exception.getResponse();
      console.log('responseMessage', responseMessage);
      message =
        typeof responseMessage === 'string'
          ? responseMessage
          : typeof responseMessage === 'object' && 'message' in responseMessage
            ? (responseMessage as any).message
            : undefined;
    } else {
      console.error('Unhandled Exception:', exception);
    }

    // ذخیره خطا در دیتابیس
    await this.errorService.logError(
      request.url,
      request.method,
      request.ip ?? '',
      JSON.stringify(message),
      status,
    );

    response.status(status).json({
      status: 'error',
      message,
    });
  }
}
