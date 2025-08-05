import { Module } from '@nestjs/common';
import { CourseCategoryService } from './course-cat.service';
import { CourseCategoryController } from './course-cat.controller';
import { CourseCatEntity } from './entities/course-cat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports:[AuthModule , TypeOrmModule.forFeature([CourseCatEntity])],
  controllers: [CourseCategoryController],
  providers: [CourseCategoryService],
  exports: [CourseCategoryService],
})
export class CourseCategoryModule {}
