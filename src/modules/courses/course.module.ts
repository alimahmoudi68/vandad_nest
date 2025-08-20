import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { CourseService } from './course.service';
import { AuthModule } from '../auth/auth.module';
import { AdminCourseController } from './adminCourse.controller';
import { CourseController } from './course.controller';
import { UploadModule } from '../upload/upload.module';
import { S3Service } from '../s3/s3.service';
import { CourseCatEntity } from '../course-cats/entities/course-cat.entity';




@Module({
  imports: [AuthModule , UploadModule, TypeOrmModule.forFeature([CourseEntity, CourseCatEntity])],
  providers: [CourseService , S3Service],
  controllers: [AdminCourseController, CourseController],
})
export class CourseModule {}
