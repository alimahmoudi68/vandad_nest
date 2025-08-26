import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { CourseService } from './course.service';
import { AuthModule } from '../auth/auth.module';
import { AdminCourseController } from './adminCourse.controller';
import { CourseController } from './course.controller';
import { UploadModule } from '../upload/upload.module';
import { S3Service } from '../s3/s3.service';
import { CourseCatEntity } from '../course-cats/entities/course-cat.entity';
import { CourseCommentService } from './comment.service';
import { CourseCommentEntity } from './entities/courseComment.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UploadEntity } from '../upload/entities/upload.entity';
import { CourseFaqEntity } from './entities/courseFaq.entity';

@Module({
  imports: [
    AuthModule,
    UploadModule,
    TypeOrmModule.forFeature([
      CourseEntity,
      CourseCatEntity,
      CourseCommentEntity,
      UserEntity,
      UploadEntity,
      CourseFaqEntity
    ]),
  ],
  providers: [CourseService, CourseCommentService, S3Service],
  controllers: [AdminCourseController, CourseController],
})
export class CourseModule {}
