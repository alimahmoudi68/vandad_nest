import { Controller, Get } from '@nestjs/common';

import { ErrorService } from './error.service';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';

@AuthDecorator()
@Controller('errors')
export class ErrorController {
  constructor(private readonly errorService: ErrorService) {}

  @Get()
  async getAllErrors() {
    return await this.errorService.getAllErrors();
  }
}
