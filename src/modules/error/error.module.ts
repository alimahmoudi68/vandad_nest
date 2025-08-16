import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ErrorEntity } from './entities/error.entity';
import { ErrorService } from './error.service';
import { ErrorController } from './error.controller';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [AuthModule , TypeOrmModule.forFeature([ErrorEntity])],
  providers: [ErrorService],
  controllers: [ErrorController],
  exports: [ErrorService], // برای استفاده در فیلتر استثناها
})
export class ErrorModule {}
