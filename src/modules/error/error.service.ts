import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorEntity } from './entities/error.entity';

@Injectable()
export class ErrorService {
  constructor(
    @InjectRepository(ErrorEntity)
    private readonly errorLogRepository: Repository<ErrorEntity>,
  ) {}

  async logError(url: string, method: string, ip: string, message: string, statusCode: number) {
    await this.errorLogRepository.save({
      url,
      method,
      ip,
      message,
      statusCode,
      timestamp: new Date(),
    });
  }

  async getAllErrors() {
    return await this.errorLogRepository.find({ order: { timestamp: 'DESC' } });
  }
}
