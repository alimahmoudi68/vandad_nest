import { Controller, Get } from '@nestjs/common';
import { ErrorService } from './error.service';

@Controller('errors')
export class ErrorController {
  constructor(private readonly errorService: ErrorService) {}

  @Get()
  async getAllErrors() {
    return await this.errorService.getAllErrors();
  }
}
