import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadEntity } from './entities/upload.entity';
import { AuthModule } from '../auth/auth.module';
import { S3Service } from '../s3/s3.service';

@Module({
  imports:[AuthModule , TypeOrmModule.forFeature([UploadEntity])],
  controllers: [UploadController],
  providers: [UploadService, S3Service],
  exports: [TypeOrmModule, UploadService]
})
export class UploadModule {}
